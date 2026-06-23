import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import type { WizardConfig, WizardClockCardConfig } from './weasley-wizarding-clock-card';

declare const CARDNAME: string;

// ── Selector / schema constants ───────────────────────────────────────────────

// Per-wizard ha-form schema. ha-form handles registration of ha-textfield,
// ha-selector, etc. — never use those elements directly in a custom editor.
const WIZARD_SCHEMA = [
  { name: 'entity',   selector: { entity: { filter: { domain: ['person', 'device_tracker', 'calendar'] } } } },
  { name: 'name',     selector: { text: {} } },
  { name: 'colour',   selector: { ui_color: {} } },
  { name: 'textcolour', selector: { ui_color: {} } },
  { name: 'proximity_sensor', selector: { entity: { filter: { integration: 'proximity' } } } },
] as const;

const WIZARD_LABELS: Record<string, string> = {
  entity:           'Entity',
  name:             'Display name',
  colour:           'Hand colour',
  textcolour:       'Name colour',
  proximity_sensor: 'Proximity sensor',
};

const WIZARD_HELPERS: Record<string, string> = {
  name:             'Short name shown on the clock hand',
  proximity_sensor: 'Optional — direction-of-travel sensor from the Proximity integration',
};

// Zone selector used for the locations section.
const ZONE_ENTITY_SELECTOR = {
  entity: { filter: { domain: 'zone' } },
} as const;

// Advanced fields — flat schema rendered inside ha-expansion-panel directly in
// the template. Using type:"expandable" inside ha-form requires ha-form-expandable
// which was added recently and may not exist in older HA versions.
const ADVANCED_SCHEMA = [
  { name: 'header',             selector: { text: {} } },
  { name: 'lost',               selector: { text: {} } },
  { name: 'travelling',         selector: { text: {} } },
  { name: 'min_location_slots', selector: { number: { min: 1, max: 20, mode: 'box' as const } } },
  { name: 'face_colour',        selector: { ui_color: {} } },
  { name: 'location_colour',    selector: { ui_color: {} } },
  { name: 'border_colour',      selector: { ui_color: {} } },
  { name: 'shaft_colour',       selector: { ui_color: {} } },
  { name: 'fontName',           selector: { text: {} } },
  { name: 'fontface',           selector: { text: { multiline: true } } },
] as const;

const ADVANCED_LABELS: Record<string, string> = {
  _advanced:          'Advanced',
  header:             'Card header',
  lost:               'Label for "Lost"',
  travelling:         'Label for "Travelling"',
  min_location_slots: 'Minimum location slots',
  face_colour:        'Clock face colour',
  location_colour:    'Location text colour',
  border_colour:      'Border colour',
  shaft_colour:       'Shaft colour',
  fontName:           'Font name',
  fontface:           '@font-face CSS',
};

const ADVANCED_HELPERS: Record<string, string> = {
  fontName:  'CSS font-family value, e.g. "Harry P"',
  fontface:  'Expert use only — raw @font-face CSS block',
};

// ── Ensure HA lazy-loaded editor components are available ─────────────────────
// Mirrors the pattern from lovelace-mushroom/src/utils/loader.ts.
// Called in connectedCallback so components are ready before first render.

function loadHaComponents() {
  if (!customElements.get('ha-form') || !customElements.get('hui-card-features-editor')) {
    (customElements.get('hui-tile-card') as any)?.getConfigElement();
  }
  if (!customElements.get('ha-entity-picker')) {
    (customElements.get('hui-entities-card') as any)?.getConfigElement();
  }
}

// ── Editor element ─────────────────────────────────────────────────────────────

@customElement(`${CARDNAME}-editor`)
class WizardClockCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: WizardClockCardConfig;
  @state() private _wizardsExpanded = true;

  // Location editing state — tracks which location chip (by index) is in rename
  // mode and what the user has typed so far. null means no chip is being edited.
  @state() private _editingLocationIdx: number | null = null;
  @state() private _editingLocationValue = '';

  // Controlled input for the "add custom location name" text field.
  @state() private _customLocationInput = '';

  // Controlled input for the "add excluded state" text field.
  @state() private _excludeInput = '';

  connectedCallback() {
    super.connectedCallback();
    loadHaComponents();
  }

  setConfig(config: WizardClockCardConfig): void {
    this._config = config;
  }

  private _fire(config: WizardClockCardConfig): void {
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config },
    }));
  }

  // ── Proximity validation ─────────────────────────────────────────────────────

  private _isDirectionOfTravelSensor(entityId: string): boolean {
    const s = this.hass?.states[entityId];
    if (!s) return true; // not loaded — don't warn yet
    const attrs = s.attributes as Record<string, unknown>;
    const options = attrs.options as string[] | undefined;
    return (
      attrs.device_class === 'enum' &&
      Array.isArray(options) &&
      options.includes('towards') &&
      options.includes('away_from')
    );
  }

  // ── Wizard helpers ───────────────────────────────────────────────────────────

  private _addWizard(): void {
    const wizards = [...(this._config?.wizards ?? []), { entity: '', name: '' }];
    this._fire({ ...this._config!, wizards });
  }

  private _removeWizard(i: number): void {
    const wizards = (this._config?.wizards ?? []).filter((_, idx) => idx !== i);
    this._fire({ ...this._config!, wizards });
  }

  private _wizardFormChanged(i: number, data: Record<string, unknown>): void {
    const prev = this._config?.wizards[i];
    let name = (data.name as string) ?? '';
    // When entity changes, clear the existing name and auto-fill from the new
    // entity's friendly_name so the display name always matches the new pick.
    if (data.entity !== prev?.entity && data.entity) {
      const attrs = this.hass?.states[data.entity as string]?.attributes as Record<string, unknown> | undefined;
      name = (attrs?.friendly_name as string | undefined) ?? '';
    }
    const w: WizardConfig = { entity: (data.entity as string) ?? '', name };
    if (data.colour)           w.colour           = data.colour as string;
    if (data.textcolour)       w.textcolour       = data.textcolour as string;
    if (data.proximity_sensor) w.proximity_sensor = data.proximity_sensor as string;
    const wizards = [...(this._config?.wizards ?? [])];
    wizards[i] = w;
    this._fire({ ...this._config!, wizards });
  }

  // ── Location helpers ─────────────────────────────────────────────────────────

  // Add a location by picking an HA zone entity. The zone's friendly_name
  // becomes the location label shown on the clock face.
  private _addLocationFromZone(e: CustomEvent): void {
    const entityId = e.detail.value as string | null;
    if (!entityId) return;
    const attrs = this.hass?.states[entityId]?.attributes as Record<string, unknown> | undefined;
    const name = (attrs?.friendly_name as string | undefined)
      ?? entityId.replace(/^zone\./, '').replace(/_/g, ' ');
    const locations = [...(this._config?.locations ?? [])];
    if (!locations.includes(name)) {
      locations.push(name);
      this._fire({ ...this._config!, locations });
    }
    this.requestUpdate(); // reset the zone picker (value stays null)
  }

  // Add a location by typing a custom name directly. Useful for states that
  // don't correspond to an HA zone (e.g. "Mortal Peril", "Diagon Alley").
  private _addCustomLocation(): void {
    const name = this._customLocationInput.trim();
    if (!name) return;
    const locations = [...(this._config?.locations ?? [])];
    if (!locations.includes(name)) {
      locations.push(name);
      this._fire({ ...this._config!, locations });
    }
    this._customLocationInput = '';
  }

  private _removeLocation(i: number): void {
    // Cancel any in-progress rename if the chip being removed is the one being edited.
    if (this._editingLocationIdx === i) this._cancelEditLocation();
    const locations = (this._config?.locations ?? []).filter((_, idx) => idx !== i);
    const cfg = { ...this._config! };
    if (locations.length === 0) delete cfg.locations;
    else cfg.locations = locations;
    this._fire(cfg);
  }

  // Enter rename mode for a location chip. Stores the current name in
  // _editingLocationValue so the user can modify it character by character.
  private _startEditLocation(i: number, current: string): void {
    this._editingLocationIdx = i;
    this._editingLocationValue = current;
  }

  // Apply the rename. Empty names are ignored — the old name is kept.
  private _commitEditLocation(): void {
    if (this._editingLocationIdx === null) return;
    const newName = this._editingLocationValue.trim();
    if (newName) {
      const locations = [...(this._config?.locations ?? [])];
      locations[this._editingLocationIdx] = newName;
      this._fire({ ...this._config!, locations });
    }
    this._editingLocationIdx = null;
    this._editingLocationValue = '';
  }

  // Dismiss rename mode without saving.
  private _cancelEditLocation(): void {
    this._editingLocationIdx = null;
    this._editingLocationValue = '';
  }

  // ── Exclude helpers ──────────────────────────────────────────────────────────
  // The exclude list holds state strings (e.g. "Just Arrived", "Just Left")
  // that should be treated as "not home" instead of shown as a clock position.

  private _addExclude(): void {
    const val = this._excludeInput.trim();
    if (!val) return;
    const exclude = [...(this._config?.exclude ?? [])];
    if (!exclude.includes(val)) {
      exclude.push(val);
      this._fire({ ...this._config!, exclude });
    }
    this._excludeInput = '';
  }

  private _removeExclude(i: number): void {
    const exclude = (this._config?.exclude ?? []).filter((_, idx) => idx !== i);
    const cfg = { ...this._config! };
    if (exclude.length === 0) delete cfg.exclude;
    else cfg.exclude = exclude;
    this._fire(cfg);
  }

  // ── Migration banner handlers ────────────────────────────────────────────────

  // Shaft colour default changed to #1a1a1a. These handlers let the user lock in
  // their preference so the banner only appears until they decide.
  private _migrateShaftToTheme(): void {
    const primary = getComputedStyle(this).getPropertyValue('--primary-color').trim();
    this._fire({ ...this._config!, shaft_colour: primary || '#6750A4' });
  }

  private _migrateShaftToDark(): void {
    this._fire({ ...this._config!, shaft_colour: '#1a1a1a' });
  }

  // ── Advanced helper ──────────────────────────────────────────────────────────

  private _advancedChanged(e: CustomEvent): void {
    const data = e.detail.value as Record<string, unknown>;
    // Spread config first so fields not in ADVANCED_SCHEMA (e.g. exclude) are
    // preserved. Then overwrite with the new form data.
    const cfg: WizardClockCardConfig = { ...this._config!, ...data };
    // Remove falsy optional fields so config stays clean.
    for (const k of [
      'header', 'lost', 'travelling',
      'shaft_colour', 'face_colour', 'location_colour', 'border_colour',
      'fontName', 'fontface',
    ] as const) {
      if (!cfg[k]) delete cfg[k];
    }
    if (cfg.min_location_slots == null) delete cfg.min_location_slots;
    this._fire(cfg);
  }

  // ── computeLabel / computeHelper (class-property arrow fns avoid rebind) ────

  private _computeWizardLabel = (schema: { name: string }) =>
    WIZARD_LABELS[schema.name] ?? schema.name;

  private _computeWizardHelper = (schema: { name: string }) =>
    WIZARD_HELPERS[schema.name] ?? '';

  private _computeAdvancedLabel = (schema: { name: string }) =>
    ADVANCED_LABELS[schema.name] ?? schema.name;

  private _computeAdvancedHelper = (schema: { name: string }) =>
    ADVANCED_HELPERS[schema.name] ?? '';

  // ── Render helpers ───────────────────────────────────────────────────────────

  private _renderWizard(w: WizardConfig, i: number) {
    const proxOk = !w.proximity_sensor || this._isDirectionOfTravelSensor(w.proximity_sensor);
    const wizardData = {
      entity:           w.entity   || null,
      name:             w.name,
      colour:           w.colour   ?? null,
      textcolour:       w.textcolour ?? null,
      proximity_sensor: w.proximity_sensor || null,
    };

    return html`
      <ha-expansion-panel outlined
        @expanded-changed=${(e: Event) => e.stopPropagation()}
      >
        <span slot="header">${w.name || w.entity || `Wizard ${i + 1}`}</span>
        <ha-icon-button
          slot="icons"
          .label=${'Remove wizard'}
          @click=${(e: Event) => { e.preventDefault(); this._removeWizard(i); }}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
        <div class="content">
          <ha-form
            .hass=${this.hass}
            .data=${wizardData}
            .schema=${WIZARD_SCHEMA}
            .computeLabel=${this._computeWizardLabel}
            .computeHelper=${this._computeWizardHelper}
            @value-changed=${(e: CustomEvent) => this._wizardFormChanged(i, e.detail.value)}
          ></ha-form>
          ${!proxOk ? html`
            <ha-alert alert-type="warning">
              This entity doesn't look like a direction-of-travel sensor.
              Expected <code>device_class: enum</code> with
              <code>towards</code> and <code>away_from</code> options.
            </ha-alert>
          ` : nothing}
        </div>
      </ha-expansion-panel>
    `;
  }

  // Renders a single location chip. When _editingLocationIdx matches this chip's
  // index the chip switches to rename mode: the label is replaced with an inline
  // text input and save/cancel icon buttons.
  private _renderLocation(loc: string, i: number) {
    if (this._editingLocationIdx === i) {
      return html`
        <div class="location-chip location-chip--editing">
          <input
            class="location-rename-input"
            type="text"
            .value=${this._editingLocationValue}
            @input=${(e: Event) => {
              this._editingLocationValue = (e.target as HTMLInputElement).value;
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter')  this._commitEditLocation();
              if (e.key === 'Escape') this._cancelEditLocation();
            }}
            @blur=${() => this._commitEditLocation()}
          />
          <ha-icon-button
            .label=${'Save rename'}
            @click=${(e: Event) => { e.preventDefault(); this._commitEditLocation(); }}
          >
            <ha-icon icon="mdi:check"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            .label=${'Cancel rename'}
            @click=${(e: Event) => { e.preventDefault(); this._cancelEditLocation(); }}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </ha-icon-button>
        </div>
      `;
    }

    return html`
      <div class="location-chip">
        <span>${loc}</span>
        <ha-icon-button
          .label=${'Rename location'}
          @click=${() => this._startEditLocation(i, loc)}
        >
          <ha-icon icon="mdi:pencil"></ha-icon>
        </ha-icon-button>
        <ha-icon-button
          .label=${'Remove location'}
          @click=${() => this._removeLocation(i)}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  protected render() {
    if (!this._config) return nothing;

    const locations = this._config.locations ?? [];
    const exclude   = this._config.exclude   ?? [];

    // Advanced form data — pass only the fields the schema contains.
    // Note: exclude is NOT in ADVANCED_SCHEMA; it is managed separately below
    // so it can render as a chip list rather than a plain text field.
    const advancedData = {
      header:             this._config.header,
      lost:               this._config.lost,
      travelling:         this._config.travelling,
      min_location_slots: this._config.min_location_slots ?? null,
      face_colour:        this._config.face_colour        ?? null,
      location_colour:    this._config.location_colour    ?? null,
      border_colour:      this._config.border_colour      ?? null,
      shaft_colour:       this._config.shaft_colour       ?? null,
      fontName:           this._config.fontName,
      fontface:           this._config.fontface,
    };

    return html`
      <div class="card-config">

        <!-- ── Migration banner: shaft_colour default changed ── -->
        ${!this._config.shaft_colour ? html`
          <ha-alert alert-type="info" title="Default hand colour changed">
            Hand and hinge colour now defaults to dark (<code>#1a1a1a</code>),
            matching the classic clock look. Previously it used your theme's
            primary colour. Choose how to proceed:
            <div class="migration-actions">
              <ha-button @click=${this._migrateShaftToTheme}>
                Restore theme colour
              </ha-button>
              <ha-button @click=${this._migrateShaftToDark}>
                Keep dark default
              </ha-button>
            </div>
          </ha-alert>
        ` : nothing}

        <!-- ── Wizards ── -->
        <ha-expansion-panel outlined
          .expanded=${this._wizardsExpanded}
          @expanded-changed=${(e: CustomEvent) => { this._wizardsExpanded = e.detail.expanded; }}
        >
          <ha-icon slot="leading-icon" icon="mdi:account-group"></ha-icon>
          <h3 slot="header">Wizards</h3>
          <div class="content">
            <div class="wizards-list">
              ${(this._config.wizards ?? []).map((w, i) => this._renderWizard(w, i))}
            </div>
            <ha-button @click=${this._addWizard}>Add wizard</ha-button>
          </div>
        </ha-expansion-panel>

        <!-- ── Locations ── -->
        <ha-expansion-panel outlined>
          <ha-icon slot="leading-icon" icon="mdi:map-marker-multiple"></ha-icon>
          <h3 slot="header">Locations</h3>
          <div class="content">
            <p class="hint" style="margin: 0 0 8px;">
              Add locations to display on the clock face, in the order you want
              them to appear. Pick a zone to use its name, or type a custom
              name for locations that don't have an HA zone (e.g.
              <em>Mortal Peril</em>). Click the pencil icon to rename.
            </p>
            ${locations.length > 0 ? html`
              <div class="location-list">
                ${locations.map((loc, i) => this._renderLocation(loc, i))}
              </div>
            ` : nothing}

            <!-- Zone picker: adds the zone's friendly_name to the locations list -->
            <ha-selector
              .hass=${this.hass}
              .selector=${ZONE_ENTITY_SELECTOR}
              .value=${null}
              placeholder="Add location from zone…"
              @value-changed=${this._addLocationFromZone}
            ></ha-selector>

            <!-- Custom name input: adds any arbitrary string as a location -->
            <div class="custom-input-row">
              <input
                class="custom-text-input"
                type="text"
                placeholder="Or type a custom location name…"
                .value=${this._customLocationInput}
                @input=${(e: Event) => {
                  this._customLocationInput = (e.target as HTMLInputElement).value;
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') this._addCustomLocation();
                }}
              />
              <ha-button @click=${this._addCustomLocation}>Add</ha-button>
            </div>
          </div>
        </ha-expansion-panel>

        <!-- ── Advanced — ha-expansion-panel pattern from lovelace-mushroom ── -->
        <ha-expansion-panel outlined>
          <ha-icon slot="leading-icon" icon="mdi:cog"></ha-icon>
          <h3 slot="header">Advanced</h3>
          <div class="content">
            <ha-form
              .hass=${this.hass}
              .data=${advancedData}
              .schema=${ADVANCED_SCHEMA}
              .computeLabel=${this._computeAdvancedLabel}
              .computeHelper=${this._computeAdvancedHelper}
              @value-changed=${this._advancedChanged}
            ></ha-form>

            <!-- Exclude list: states treated as "not home" instead of clock positions.
                 Common use: exclude "Just Arrived"/"Just Left" (Life360) so those
                 brief transition states don't flicker as separate clock positions. -->
            <div class="exclude-section">
              <p class="hint">
                <strong>Excluded states</strong> — wizards in these states are
                treated as "not home" rather than shown as a separate clock
                position. Useful for brief Life360 transition states like
                "Just Arrived" or "Just Left".
              </p>
              ${exclude.length > 0 ? html`
                <div class="location-list">
                  ${exclude.map((ex, i) => html`
                    <div class="location-chip">
                      <span>${ex}</span>
                      <ha-icon-button
                        .label=${'Remove excluded state'}
                        @click=${() => this._removeExclude(i)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </ha-icon-button>
                    </div>
                  `)}
                </div>
              ` : nothing}
              <div class="custom-input-row">
                <input
                  class="custom-text-input"
                  type="text"
                  placeholder="State to exclude…"
                  .value=${this._excludeInput}
                  @input=${(e: Event) => {
                    this._excludeInput = (e.target as HTMLInputElement).value;
                  }}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') this._addExclude();
                  }}
                />
                <ha-button @click=${this._addExclude}>Add</ha-button>
              </div>
            </div>
          </div>
        </ha-expansion-panel>

      </div>
    `;
  }

  static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .hint {
      margin: 0;
      font-size: var(--ha-font-size-s, 0.875rem);
      color: var(--secondary-text-color);
    }

    .wizards-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    ha-alert {
      display: block;
      margin-top: 8px;
    }

    .migration-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    /* ── Locations and exclude chip list ── */

    .location-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .location-chip {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px 4px 4px 12px;
      background: var(--secondary-background-color);
      border-radius: 16px;
      font-size: var(--ha-font-size-s, 0.875rem);
    }

    /* Rename mode: chip stretches to fit the inline input */
    .location-chip--editing {
      padding: 2px 4px 2px 8px;
    }

    /* Inline rename input — sits flush inside the chip */
    .location-rename-input {
      width: 10em;
      height: 24px;
      padding: 0 4px;
      border: none;
      border-bottom: 1px solid var(--primary-color);
      background: transparent;
      color: var(--primary-text-color);
      font-size: var(--ha-font-size-s, 0.875rem);
      outline: none;
    }

    .location-chip ha-icon-button {
      --mdc-icon-button-size: 28px;
      --mdc-icon-size: 16px;
    }

    /* ── Custom text inputs (add location / add exclude) ── */

    .custom-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 8px;
    }

    /* Styled to match HA's text fields as closely as possible without
       depending on ha-textfield (which AGENTS.md prohibits) */
    .custom-text-input {
      flex: 1;
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: var(--ha-font-size-m, 1rem);
      font-family: inherit;
      box-sizing: border-box;
    }

    .custom-text-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .exclude-section {
      margin-top: 16px;
    }

    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: 6px;
      --ha-card-border-radius: 6px;
    }

    ha-expansion-panel .content {
      padding: 12px;
    }

    ha-expansion-panel > *[slot='header'] {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
    }

    ha-expansion-panel ha-icon {
      color: var(--secondary-text-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'weasley-wizarding-clock-card-editor': WizardClockCardEditor;
  }
}
