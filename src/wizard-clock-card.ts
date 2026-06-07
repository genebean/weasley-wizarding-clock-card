import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

// Injected at build time via esbuild --define. Do not assign here or esbuild
// will inline the literal and --define will have no effect.
//   Production: --define:CARDNAME='"wizard-clock-card"'
//   Dev:        --define:CARDNAME='"wizard-clock-card-dev"'
declare const CARDNAME: string;

const VERSION = '0.9.0';

const DEBUG = false;

const FONT_SCALE = 1.1;

// Tracks @font-face strings already injected into the document so repeated
// setConfig() calls (e.g. while editing YAML) don't append duplicate rules.
const _injectedFontFaces = new Set<string>();

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WizardConfig {
  entity: string;
  name: string;
  colour?: string;
  textcolour?: string;
  proximity_sensor?: string;
}

export interface WizardClockCardConfig {
  wizards: WizardConfig[];
  locations?: string[];
  width?: number;
  lost?: string;
  // Canonical British English spelling; migrateConfig() maps 'traveling' here.
  travelling?: string;
  min_location_slots?: number;
  header?: string;
  // Canonical camelCase spelling; migrateConfig() maps 'fontname' here.
  fontName?: string;
  fontface?: string;
  shaft_colour?:    string;
  face_colour?:     string;
  location_colour?: string;
  border_colour?:   string;
  exclude?: string[];
}

interface HandState {
  pos: number;
  length: number;
  width: number;
  wizard: string;
  colour?: string;
  textcolour?: string;
}

interface ThemeColours {
  primary:     string;
  primaryText: string;
}

// ── Custom element ─────────────────────────────────────────────────────────────

@customElement(CARDNAME)
class WizardClockCard extends LitElement {

  // hass is set by HA on every state change. Lit's reactive property system
  // triggers updated() automatically, replacing the manual set hass() setter.
  @property({ attribute: false }) public hass!: HomeAssistant;

  // Set by HA to indicate the current layout context.
  // 'grid' = sections layout (both width and height are grid-allocated).
  // 'masonry' or undefined = masonry layout (height is content-driven).
  // Used to decide whether to constrain canvas by height or width only.
  @property({ type: String }) public layout?: string;

  @state() private _config!: WizardClockCardConfig;

  // References to DOM elements rendered by render().
  @query('ha-card') private _haCard!: HTMLElement;
  @query('canvas') private _canvas!: HTMLCanvasElement;

  // Canvas state
  private _ctx?: CanvasRenderingContext2D;
  private _radius = 0;

  // Animation state
  private _lastframe = 0;
  private _boundDrawClock = (): void => this._drawClock();

  // Entity IDs this card watches. Rebuilt when config changes. Only a change
  // to one of these entities justifies a redraw — HA fires hass updates for
  // every entity on the system, so we must not redraw on unrelated changes.
  private _trackedEntities: string[] = [];

  // Per-instance resize debounce — multiple cards on a dashboard must not
  // share a timeout, so this is an instance field, not a module global.
  private _resizeObserver?: ResizeObserver;
  private _resizeTimeout?: ReturnType<typeof setTimeout>;

  // Zone and wizard state, rebuilt on every hass update.
  private _zones: string[] = [];
  private _wizardStates: Record<string, string> = {};
  private _targetstate: HandState[] = [];
  private _currentstate: HandState[] = [];

  // Cached theme colours, read once per update so drawing functions do not
  // call getComputedStyle on every animation frame.
  // CSS custom properties cascade through shadow DOM boundaries by spec, so
  // reading from `this` (the shadow host) gives HA's theme values correctly.
  private _colours: ThemeColours = {
    primary:     '',
    primaryText: '',
  };

  // Resolved config values — extracted once in setConfig() and after migration.
  private _lostState = 'Lost';
  private _travellingState = 'Travelling';
  private _minLocationSlots = 0;
  private _selectedFont = 'Palatino Linotype, Palatino, Book Antiqua, serif';
  private _shaftColour    = '';
  private _faceColour     = '';
  private _locationColour = '';
  private _borderColour   = '';
  private _exclude: string[] = [];

  // Text metrics cache — rebuilt in _updateAndDraw() when zones or radius change.
  // Avoids measureText() calls on every animation frame in _drawNumbers().
  private _charWidthCache: Map<string, number> = new Map();
  private _textHeight = 0;

  // ── Styles ──────────────────────────────────────────────────────────────────

  // Scoped styles apply to this shadow root only.
  //
  // ha-card { height: 100% } fills the CSS Grid cell in sections layout.
  // In masonry, :host has no definite height so 100% resolves to auto,
  // making ha-card content-size to the canvas — same as before.
  // .clock-container { height: 100% } ensures ha-card's full interior is
  // covered by the card background (no white gap outside ha-card).
  // Canvas display size is driven by JS in _updateAndDraw().
  static styles = css`
    :host {
      display: block;
      /* In sections layout hui-grid-section gives the .card wrapper an explicit
         height. height: 100% here propagates that into our shadow DOM so that
         ha-card { height: 100% } can resolve to a definite value. In masonry
         the wrapper has no explicit height so this resolves to auto, which
         content-sizes to the canvas — the same as before. */
      height: 100%;
    }
    ha-card {
      height: 100%;
      overflow: hidden;
    }
    .clock-container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      box-sizing: border-box;
      overflow: hidden;
    }
    canvas {
      display: block;
      /* Start at 0 so masonry offsetHeight stays near 0 before JS runs.
         JS overrides these via canvas.style.width/height. */
      width: 0;
      height: 0;
    }
  `;

  // ── HA lifecycle ─────────────────────────────────────────────────────────────

  // Called by HA before the element is connected. Throw to show an error card.
  setConfig(rawConfig: Record<string, unknown>): void {
    console.info(
      '%c %s %c %s',
      'color: white; background: forestgreen; font-weight: 700;',
      CARDNAME.toUpperCase(),
      'color: forestgreen; background: white; font-weight: 700;',
      VERSION,
    );

    if (!rawConfig.wizards) throw new Error('You need to define some wizards');

    this._config = WizardClockCard.migrateConfig(rawConfig);

    this._lostState        = this._config.lost ?? 'Lost';
    this._travellingState  = this._config.travelling ?? 'Travelling';
    this._minLocationSlots = this._config.min_location_slots ?? 0;
    this._selectedFont     = this._config.fontName ?? 'Palatino Linotype, Palatino, Book Antiqua, serif';
    this._exclude          = [...(this._config.exclude ?? [])];
    this._trackedEntities  = this._buildTrackedEntityList();

    // @font-face rules must be injected into the document (not the shadow root)
    // so the browser's font registry picks them up for canvas text rendering.
    // Guard with a module-level Set so repeated setConfig() calls (e.g. while
    // editing YAML) don't append duplicate rules to document.body.
    if (this._config.fontface && !_injectedFontFaces.has(this._config.fontface)) {
      _injectedFontFaces.add(this._config.fontface);
      const style = document.createElement('style');
      style.textContent = `@font-face { ${this._config.fontface} }`;
      document.body.appendChild(style);
    }
  }

  // Returns the editor element HA shows in the card editor dialog.
  // Dynamic import keeps editor code out of the critical render path —
  // it is only parsed when someone actually opens the card editor.
  static async getConfigElement() {
    await import('./wizard-clock-card-editor');
    return document.createElement(`${CARDNAME}-editor`);
  }

  // Minimal valid config shown in the "Add Card" dialog preview.
  // HA always provides hass when calling this for custom cards.
  static getStubConfig(hass: HomeAssistant): WizardClockCardConfig {
    const entity = Object.keys(hass.states).find(id => id.startsWith('person.')) ?? '';
    const name   = entity
      ? ((hass.states[entity].attributes as Record<string, unknown>).friendly_name as string ?? 'Wizard')
      : 'Wizard';
    return { wizards: [{ entity, name }] };
  }

  // Tells HA how many 50px rows the card occupies (used by masonry layout).
  getCardSize(): number {
    return 6;
  }

  // Tells HA's sections layout the default and minimum grid dimensions.
  // columns: 12 spans the full section width.
  // rows: 8 at the default HA row height (~56px) gives ~448px — roughly square
  // for sections in the 400–500px wide range. The user can drag-resize freely;
  // CSS aspect-ratio keeps the clock round at any card dimensions.
  getGridOptions() {
    return {
      columns:     12,
      rows:        7,
      min_columns: 2,
      min_rows:    2,
      max_rows:    8,
    };
  }

  // ── Lit lifecycle ─────────────────────────────────────────────────────────────

  render() {
    return html`
      <ha-card .header=${this._config?.header}>
        <div class="clock-container">
          <canvas></canvas>
        </div>
      </ha-card>
    `;
  }

  // Runs once after the first render, when shadow DOM is populated.
  // Safe to query elements and set up observers here.
  firstUpdated(): void {
    const ctx = this._canvas.getContext('2d');
    if (!ctx) throw new Error(`Browser does not support ${CARDNAME} canvas.`);
    this._ctx = ctx;

    // Watch the host element for size changes (window resize, HA grid reflow).
    // Sizing reads this.offsetWidth/offsetHeight so observing the host is the
    // correct target — observing the canvas would create a feedback loop where
    // our own buffer writes trigger new observer notifications.
    this._resizeObserver = new ResizeObserver(() => {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        if (this.hass) this._updateAndDraw();
      }, 100);
    });
    this._resizeObserver.observe(this);
  }

  // Called after every reactive update (hass change, _config change).
  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (changedProps.has('_config') || changedProps.has('layout')) {
      if (changedProps.has('_config')) {
        this._trackedEntities = this._buildTrackedEntityList();
      }
      this._updateAndDraw();
      return;
    }

    if (changedProps.has('hass')) {
      const prev = changedProps.get('hass') as HomeAssistant | undefined;
      if (!prev) {
        // First hass assignment — always draw.
        this._updateAndDraw();
        return;
      }
      // HA fires hass updates for every entity change on the system. Only
      // redraw when one of the entities this card actually cares about changed.
      // State objects are replaced on change, so identity comparison suffices.
      const relevant = this._trackedEntities.some(
        id => prev.states[id] !== this.hass.states[id],
      );
      if (relevant) this._updateAndDraw();
    }
  }

  // Clean up when the card is removed from the dashboard.
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    if (this._lastframe) {
      cancelAnimationFrame(this._lastframe);
      this._lastframe = 0;
    }
    clearTimeout(this._resizeTimeout);
  }

  // ── Colour resolution ────────────────────────────────────────────────────────

  // Maps HA ui_color token names to their CSS custom properties so canvas can
  // use them. Users pick these from the ui_color picker in the editor.
  private static readonly _COLOR_TOKENS: Record<string, string> = {
    'primary':              '--primary-color',
    'accent':               '--accent-color',
    'primary-background':   '--primary-background-color',
    'secondary-background': '--secondary-background-color',
    'primary-text':         '--primary-text-color',
    'secondary-text':       '--secondary-text-color',
    'disabled':             '--disabled-color',
    'error':                '--error-color',
    'warning':              '--warning-color',
    'success':              '--success-color',
    'info':                 '--info-color',
  };

  // Converts a ui_color value (hex string, CSS colour name, or HA colour token)
  // to a string canvas fillStyle/strokeStyle can consume.
  private _resolveColour(token: string, cs: CSSStyleDeclaration, fallback: string): string {
    if (!token) return fallback;
    if (token.startsWith('#') || /^rgba?|^hsla?/.test(token)) return token;
    const cssVar = WizardClockCard._COLOR_TOKENS[token];
    if (cssVar) return cs.getPropertyValue(cssVar).trim() || fallback;
    return token; // CSS named colour (red, blue…) or unknown — use as-is
  }

  // ── Drawing ───────────────────────────────────────────────────────────────────

  // Rebuilds zone/wizard state and kicks off the animation frame.
  // Called on every relevant hass update and on resize.
  private _updateAndDraw(): void {
    if (!this._haCard || !this._canvas || !this._ctx) return;

    // Canvas starts at 0×0 (CSS), so in masonry this.offsetHeight is near 0
    // before JS sizes us, and ≈ canvas width after — both cases fall through
    // to width-only. In sections layout CSS Grid gives the host a definite
    // height (independent of canvas content), so availH is the real grid
    // allocation and we constrain the clock to fit. The 50px floor filters
    // out host border/padding that could produce a small non-zero offsetHeight
    // in masonry before the first sizing pass.
    const pad    = 16;
    const availW = this.offsetWidth  - pad;
    const availH = this.offsetHeight - pad;
    const size = (availH > 50 && availH < availW) ? availH : availW;

    if (size <= 0) {
      // Host hasn't been laid out yet. Retry next frame; RAF won't fire on
      // inactive tabs so this won't loop while the card is off-screen.
      if (DEBUG) console.log(`${this._tag()}size=0, retrying after layout`);
      requestAnimationFrame(() => this._updateAndDraw());
      return;
    }

    // Setting canvas.width/height resets the context, including all transforms.
    // The translate to centre must happen immediately after.
    this._canvas.width        = size;
    this._canvas.height       = size;
    // Explicitly set CSS display size so the canvas doesn't scale up from its
    // default 300×150 intrinsic size before JS runs.
    this._canvas.style.width  = `${size}px`;
    this._canvas.style.height = `${size}px`;

    this._radius = size / 2;
    this._ctx.translate(this._radius, this._radius);
    this._radius = this._radius * 0.90;

    // CSS custom properties cascade through shadow DOM boundaries, so reading
    // from the host element gives HA's current theme values.
    const cs = getComputedStyle(this);
    this._colours = {
      primary:     cs.getPropertyValue('--primary-color').trim(),
      primaryText: cs.getPropertyValue('--primary-text-color').trim(),
    };

    // Resolve all configurable colours from config on every update so theme
    // token values (e.g. "primary") reflect the current theme.
    const rc = (v: string | undefined, def: string) =>
      this._resolveColour(v ?? '', cs, def);
    this._faceColour     = rc(this._config.face_colour,     '#EDE0C4');
    this._locationColour = rc(this._config.location_colour, '#1a1a1a');
    this._borderColour   = rc(this._config.border_colour,   '#1a1a1a');
    this._shaftColour    = rc(this._config.shaft_colour,    '#1a1a1a');

    // Build zone list from configured locations then add any wizard states
    // that are not already represented (e.g. Lost, Travelling, unknown zones).
    this._zones = [];
    for (const loc of (this._config.locations ?? [])) {
      if (!this._zones.includes(loc)) this._zones.push(loc);
    }

    this._wizardStates = {};
    for (const wizard of this._config.wizards) {
      const stateStr = this._getWizardState(wizard);
      this._wizardStates[wizard.entity] = stateStr;
      if (DEBUG) console.log(`${this._tag()}(${wizard.name}) state: ${stateStr}`);
      if (!this._zones.includes(stateStr)) {
        if (typeof stateStr !== 'string')
          throw new Error(`Unable to add state for ${wizard.entity}: expected string, got ${typeof stateStr}`);
        this._zones.push(stateStr);
      }
    }

    while (this._zones.length < this._minLocationSlots) {
      this._zones.push(' ');
    }

    // Compute target hand positions once per state update so _drawTime() does
    // not allocate new objects on every animation frame.
    this._targetstate = this._buildTargetState(cs);

    // Sync non-animated hand properties (length, width, colours) to currentstate
    // so a canvas resize immediately redraws hands at the correct new dimensions.
    for (let i = 0; i < this._targetstate.length; i++) {
      if (this._currentstate[i]) {
        const t = this._targetstate[i];
        this._currentstate[i].length     = t.length;
        this._currentstate[i].width      = t.width;
        this._currentstate[i].wizard     = t.wizard;
        this._currentstate[i].colour     = t.colour;
        this._currentstate[i].textcolour = t.textcolour;
      }
    }

    // Pre-measure all character widths at the label font size so _drawNumbers()
    // can look them up from a Map instead of calling measureText() each frame.
    this._ctx.save();
    this._ctx.font = `${this._radius * 0.15 * FONT_SCALE}px ${this._selectedFont}`;
    const m = this._ctx.measureText('Mg');
    this._textHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    this._charWidthCache.clear();
    for (const zone of this._zones) {
      for (const char of zone) {
        if (!this._charWidthCache.has(char)) {
          this._charWidthCache.set(char, this._ctx.measureText(char).width);
        }
      }
    }
    this._ctx.restore();

    if (this._lastframe) {
      cancelAnimationFrame(this._lastframe);
      this._lastframe = 0;
    }
    this._lastframe = requestAnimationFrame(this._boundDrawClock);
    if (DEBUG) console.log(`${this._tag()}update complete, zones: ${this._zones.join(', ')}`);
  }

  // Single source of truth for a wizard's current state string.
  // Accepts a full WizardConfig (or a plain entity string for internal calls).
  private _getWizardState(wizard: WizardConfig | string): string {
    const entity = typeof wizard === 'string' ? wizard : wizard.entity;
    const state  = this.hass.states[entity];

    if (!state) {
      console.log(`${this._tag()}Wizard ${entity} does not exist.`);
      return this._lostState;
    }

    // Determine movement: velocity attribute, speed attribute, moving flag, or
    // proximity sensor reporting towards/away_from.
    const attrs = state.attributes as Record<string, unknown>;
    const stateVelo =
      (attrs.velocity as number | undefined) ??
      (attrs.speed    as number | undefined) ??
      (attrs.moving ? 16 : 0);

    const proxSensor = typeof wizard === 'string' ? null : wizard.proximity_sensor;
    const proxState  = proxSensor ? this.hass.states[proxSensor] : undefined;
    const isMovingByProximity =
      proxState && ['towards', 'away_from'].includes(proxState.state);

    // Priority: message attribute → zone attribute → entity state.
    let stateStr = 'not_home';
    if (state.state && state.state !== 'off' && state.state !== 'unknown') {
      if (
        ['home', 'Home', 'Just Arrived', 'Just Left'].includes(state.state) &&
        !this._exclude.includes(state.state)
      ) {
        stateStr = state.state;
      } else if (attrs.message) {
        stateStr = attrs.message as string;
      } else if (attrs.zone) {
        stateStr = attrs.zone as string;
      } else {
        stateStr = state.state;
      }
    }

    if (this._exclude.includes(stateStr)) stateStr = 'not_home';

    // Replace zone ID with its friendly name if available.
    const zoneEntity = this.hass.states[`zone.${stateStr}`];
    if (zoneEntity?.attributes) {
      const friendly = (zoneEntity.attributes as Record<string, unknown>).friendly_name;
      if (friendly) stateStr = friendly as string;
    }

    // Away from any known zone: resolve to Travelling, Lost, or locality.
    if (stateStr.toLowerCase() === 'away' || stateStr === 'not_home') {
      stateStr = (stateVelo > 15 || isMovingByProximity)
        ? this._travellingState
        : this._lostState;

      const locality = attrs.locality as string | undefined;
      if (locality && !this._exclude.includes(locality)) {
        stateStr = locality;
      }
    } else if (stateStr === 'unavailable') {
      stateStr = this._lostState;
    }

    return stateStr;
  }

  private _drawClock(): void {
    this._lastframe = 0;

    // Origin is translated to canvas centre, so offset by half each dimension
    // to reach the top-left corner for the clear.
    this._ctx!.clearRect(
      -this._canvas.width  / 2,
      -this._canvas.height / 2,
       this._canvas.width,
       this._canvas.height,
    );

    this._drawFace();
    this._drawNumbers();
    this._drawTime();
    this._drawHinge();

    // Continue the animation loop until all hands reach their target positions.
    const needsRedraw = this._currentstate.some(
      (cur, i) => Math.round(cur.pos * 100) !== Math.round(this._targetstate[i]?.pos * 100),
    );
    if (needsRedraw) {
      this._lastframe = requestAnimationFrame(this._boundDrawClock);
    }
  }

  private _drawFace(): void {
    const ctx = this._ctx!;
    ctx.save();
    ctx.shadowColor   = '';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, 2 * Math.PI);
    ctx.fillStyle   = this._faceColour;
    ctx.fill();
    ctx.strokeStyle = this._borderColour;
    ctx.lineWidth   = this._radius * 0.08;
    ctx.stroke();
    ctx.restore();
  }

  private _drawHinge(): void {
    const ctx = this._ctx!;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this._radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle     = this._shaftColour;
    ctx.shadowColor   = '#0008';
    ctx.shadowBlur    = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore();
  }

  private _drawNumbers(): void {
    const ctx        = this._ctx!;
    const r          = this._radius;
    const textHeight = this._textHeight; // pre-measured in _updateAndDraw()
    ctx.font         = `${r * 0.15 * FONT_SCALE}px ${this._selectedFont}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'center';
    ctx.fillStyle    = this._locationColour;

    for (let num = 0; num < this._zones.length; num++) {
      ctx.save();

      const ang = num * Math.PI / this._zones.length * 2;
      ctx.rotate(ang);

      // Flip text in the bottom half so it reads inward rather than upside-down.
      let startAngle   = 0;
      let inwardFacing = true;
      const kerning    = 0;
      let text = this._zones[num].split('').reverse().join('');

      if (ang > Math.PI / 2 && ang < (Math.PI * 2) - (Math.PI / 2)) {
        startAngle   = Math.PI;
        inwardFacing = false;
        text         = this._zones[num];
      }

      if (this._isRtlLanguage(text)) text = text.split('').reverse().join('');

      // Pre-rotate 50% of total arc so the text is centre-aligned on the spoke.
      // Character widths were pre-measured in _updateAndDraw(); look up from cache.
      for (let j = 0; j < text.length; j++) {
        const charWid = this._charWidthCache.get(text[j]) ?? ctx.measureText(text[j]).width;
        startAngle += ((charWid + (j === text.length - 1 ? 0 : kerning)) / (r - textHeight)) / 2;
      }
      ctx.rotate(startAngle);

      for (let j = 0; j < text.length; j++) {
        const charWid = this._charWidthCache.get(text[j]) ?? ctx.measureText(text[j]).width;
        ctx.rotate((charWid / 2) / (r - textHeight) * -1);
        ctx.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - r + textHeight));
        ctx.rotate((charWid / 2 + kerning) / (r - textHeight) * -1);
      }

      ctx.restore();
    }
  }

  // _targetstate is computed once in _updateAndDraw() when entity state or
  // config changes. Here we only interpolate and draw — no per-frame allocations.
  private _drawTime(): void {
    for (let num = 0; num < this._config.wizards.length; num++) {
      if (this._currentstate[num]) {
        this._currentstate[num].pos +=
          (this._targetstate[num].pos - this._currentstate[num].pos) / 60;
      } else {
        // First appearance: start at 12 o'clock.
        this._currentstate.push({ ...this._targetstate[num], pos: 0 });
      }
    }
    for (const hand of this._currentstate) {
      this._drawHand(hand);
    }
  }

  private _buildTargetState(cs: CSSStyleDeclaration): HandState[] {
    const targets: HandState[] = [];
    for (let num = 0; num < this._config.wizards.length; num++) {
      const wizard       = this._config.wizards[num];
      const stateStr     = this._wizardStates[wizard.entity] ?? this._lostState;
      const wizardOffset = ((num - (this._config.wizards.length - 1) / 2) / this._config.wizards.length) * 0.3;
      let location       = wizardOffset;

      for (let locnum = 0; locnum < this._zones.length; locnum++) {
        if (this._zones[locnum].toLowerCase() === stateStr.toLowerCase()) {
          location = locnum + wizardOffset;
          break;
        }
      }

      const displayName = wizard.name
        || (this.hass.states[wizard.entity]?.attributes as Record<string, unknown>)?.friendly_name as string | undefined
        || wizard.entity;

      // Resolve colour tokens (e.g. "primary" from the ui_color picker) to
      // actual CSS values now, so _drawHand() gets canvas-ready colour strings.
      const colour     = wizard.colour
        ? this._resolveColour(wizard.colour,     cs, this._colours.primary)
        : undefined;
      const textcolour = wizard.textcolour
        ? this._resolveColour(wizard.textcolour, cs, this._colours.primaryText)
        : undefined;

      targets.push({
        pos:        location * Math.PI / this._zones.length * 2,
        length:     this._radius * 0.7,
        width:      this._radius * 0.1,
        wizard:     displayName,
        colour,
        textcolour,
      });
    }
    return targets;
  }

  private _drawHand(hand: HandState): void {
    const ctx = this._ctx!;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth     = hand.width;
    ctx.fillStyle     = hand.colour ?? this._colours.primary;
    ctx.shadowColor   = '#0008';
    ctx.shadowBlur    = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.moveTo(0, 0);
    ctx.rotate(hand.pos);
    ctx.quadraticCurveTo( hand.width,       -hand.length * 0.5,  hand.width,  -hand.length * 0.75);
    ctx.quadraticCurveTo( hand.width * 0.2, -hand.length * 0.8,  0,           -hand.length);
    ctx.quadraticCurveTo(-hand.width * 0.2, -hand.length * 0.8, -hand.width,  -hand.length * 0.75);
    ctx.quadraticCurveTo(-hand.width,       -hand.length * 0.5,  0,            0);
    ctx.fill();

    ctx.font         = `${hand.width * FONT_SCALE}px ${this._selectedFont}`;
    ctx.fillStyle    = hand.textcolour ?? this._colours.primaryText;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';
    // Anchor at the widest flare point (75% from hinge toward tip).
    // After rotate(PI/2), local +x points toward the hinge for every hand.pos,
    // so text always reads from the flare inward — no per-quadrant flip needed.
    ctx.translate(0, -hand.length * 0.75);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(hand.wizard, 0, 0);
    ctx.restore();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────

  // Returns the entity IDs this card needs to watch: each wizard's entity and
  // any configured proximity sensor. Zone entities are intentionally excluded —
  // zone state (friendly_name, boundary) changes are extremely rare and will be
  // picked up on the next wizard entity update anyway.
  private _buildTrackedEntityList(): string[] {
    if (!this._config?.wizards) return [];
    const ids: string[] = [];
    for (const w of this._config.wizards) {
      ids.push(w.entity);
      if (w.proximity_sensor) ids.push(w.proximity_sensor);
    }
    return ids;
  }

  private _isRtlLanguage(text: string): boolean {
    return /[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
  }

  private _tag(): string {
    return this._config?.header ? `(${this._config.header}) ` : '';
  }

  // Maps old/alternate property names to canonical ones before any other code
  // sees the config. Keeps all normalisation in one place.
  //
  // Canonical forms:
  //   travelling  (British English) — was: traveling
  //   fontName    (camelCase)       — was: fontname
  private static migrateConfig(raw: Record<string, unknown>): WizardClockCardConfig {
    const c = { ...raw };
    if ('traveling' in c && !('travelling' in c)) {
      c.travelling = c.traveling;
      delete c.traveling;
    }
    if ('fontname' in c && !('fontName' in c)) {
      c.fontName = c.fontname;
      delete c.fontname;
    }
    return c as WizardClockCardConfig;
  }
}

// ── customCards registration ───────────────────────────────────────────────────

(window as typeof window & { customCards?: Record<string, unknown>[] }).customCards ??= [];
(window as typeof window & { customCards?: Record<string, unknown>[] }).customCards!.push({
  type:        CARDNAME,
  name:        'Wizard Clock Card',
  description: 'Harry Potter-style location clock for Home Assistant',
  preview:     true,
});

// Ensure the TypeScript compiler knows about the custom element tag name.
declare global {
  interface HTMLElementTagNameMap {
    'wizard-clock-card': WizardClockCard;
  }
}
