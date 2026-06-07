# AGENTS.md — wizard-clock-card

Harry Potter-style location clock for Home Assistant Lovelace. Shows family
members (called "wizards") as clock hands pointing to their current location
zone. Styled after the Weasley family clock from the books.

This file is self-contained. It does not rely on any parent AGENTS.md.

---

## Who You're Working With

The owner is an experienced infrastructure engineer (SRE) who manages Linux
fleets, runs a NixOS homelab, and is comfortable in a terminal. He is **not an
application developer**. When working on this code:

- Comment generously — future maintenance may be done by an agent without full
  context, or by the owner returning to code he didn't write
- Prefer explicit over implicit — avoid patterns that require deep HA or Lit
  framework knowledge to maintain
- Prefer simple over clever — the best solution is the one easiest to
  understand six months later
- If something is non-obvious, explain it in a comment at the point of use

---

## Project Structure

```
src/
  wizard-clock-card.ts       # Main card element (LitElement + canvas)
  wizard-clock-card-editor.ts # Card editor element (HA card editor dialog)
wizard-clock-card.js         # Prod build (element: wizard-clock-card)
wizard-clock-card-dev.js     # Dev build  (element: wizard-clock-card-dev)
flake.nix                    # Nix dev shell + nix build package
package.json                 # npm scripts (build, build:dev, watch, watch:dev)
tsconfig.json
```

---

## Tooling Contract — Nix Dev Shell

This project has a `flake.nix` with `devShells.default`. All tooling runs
inside `nix develop`.

- **Never assume node, npm, esbuild, or tsc exist on the host PATH**
- **Never install tools globally or with any system package manager**
- All commands that invoke project tooling must be prefixed with
  `nix develop --command` or run from inside an active `nix develop` shell

---

## Build Commands

Two separate bundles with different `CARDNAME` constants baked in at build time.
The constant controls the custom element name HA looks for.

| Command | Output file | Element name |
|---|---|---|
| `npm run build` | `wizard-clock-card.js` | `wizard-clock-card` |
| `npm run build:dev` | `wizard-clock-card-dev.js` | `wizard-clock-card-dev` |

**CRITICAL — never copy one built file over the other.** Copying the prod build
over the dev file registers the wrong element name, breaking all existing dev
cards ("configuration error") and removing them from the card picker. Always
run the correct build script.

During active development, **only run the dev build**:

```
nix develop --command npm run build:dev
```

Only run `npm run build` (prod) when cutting an actual release — not during
feature work. The prod file should not be updated until dev is ready to ship.

`nix build` (the Nix package build) produces `wizard-clock-card.js` in
`result/` and is used for release packaging — same rule applies.

---

## Architecture

### Card element (`wizard-clock-card.ts`)

- `WizardClockCard extends LitElement` — registered as `wizard-clock-card` (or
  `wizard-clock-card-dev` in dev builds) via `@customElement(CARDNAME)`
- Renders an `<ha-card>` containing a single `<canvas>`
- Canvas is sized by JS in `_updateAndDraw()`, not CSS. CSS initialises it to
  `width: 0; height: 0` so masonry layout doesn't see canvas intrinsic size
- A `ResizeObserver` (100 ms debounce) on the host element drives redraws when
  the card is resized
- `set hass(value)` only triggers redraws when a tracked entity actually
  changes (not on every hass update)
- `getConfigElement()` uses a dynamic import for the editor so it's not parsed
  on page load
- `getGridOptions()` returns `{ columns: 12, rows: 7, min_columns: 2,
  min_rows: 2, max_rows: 8 }` — required for height resizing in sections layout

### Canvas sizing logic

```typescript
const pad    = 16;
const availW = this.offsetWidth  - pad;
const availH = this.offsetHeight - pad;
// Use height only when the card is taller than it is wide (sections layout).
// The 50px floor filters masonry's near-zero offsetHeight before first layout.
const size = (availH > 50 && availH < availW) ? availH : availW;
if (size <= 0) { requestAnimationFrame(() => this._updateAndDraw()); return; }
```

### Editor element (`wizard-clock-card-editor.ts`)

- `WizardClockCardEditor extends LitElement` — registered as
  `${CARDNAME}-editor`
- Fires `config-changed` custom events; HA calls `setConfig()` in response
- Uses HA-native components exclusively (`ha-form`, `ha-expansion-panel`,
  `ha-selector`, `ha-icon-button`, `ha-alert`, `ha-button`)
- `loadHaComponents()` (called in `connectedCallback`) triggers lazy-loading of
  HA's editor components using the mushroom pattern

---

## ha-expansion-panel Patterns

There are exactly **two correct patterns**. Mixing them causes card shrinking,
broken inputs, and layout instability.

### Pattern A — starts COLLAPSED (Advanced, Locations sections)

Plain bare panel. No `.expanded` binding, no `@expanded-changed` handler.

```html
<ha-expansion-panel outlined>
  <ha-icon slot="leading-icon" icon="mdi:cog"></ha-icon>
  <h3 slot="header">Section Name</h3>
  <div class="content">
    <!-- content here -->
  </div>
</ha-expansion-panel>
```

### Pattern B — starts EXPANDED (Wizards outer panel)

Use `@state()` to own the expanded value. Child panels inside **must** stop
propagation so their init-time `expanded-changed: false` doesn't collapse the
outer panel.

```typescript
@state() private _wizardsExpanded = true;
```

```html
<ha-expansion-panel outlined
  .expanded=${this._wizardsExpanded}
  @expanded-changed=${(e: CustomEvent) => { this._wizardsExpanded = e.detail.expanded; }}
>
  <!-- each inner ha-expansion-panel MUST have: -->
  <ha-expansion-panel outlined
    @expanded-changed=${(e: Event) => e.stopPropagation()}
  >
```

**Why stopPropagation is required:** `ha-expansion-panel` fires
`expanded-changed` (composed + bubbling) on every LitElement first-render
cycle. Inner panels fire `expanded-changed: false` on init; without
`stopPropagation()` this bubbles through the slot into the outer panel's
handler and immediately collapses the outer panel, causing continuous layout
shifts and card visual breakage.

**Never add `@expanded-changed` to a panel that starts collapsed** — even a
bare `e.stopPropagation()` handler causes the same instability.

---

## HA-Native Component Patterns

- Use `ha-form` with `selector:` objects for all user inputs — never use
  `ha-textfield`, `ha-entity-picker`, etc. directly in templates
- Color fields use `selector: { ui_color: {} }` — gives the button-card style
  picker (named theme colors + custom hex); value is stored as a string
  compatible with canvas `fillStyle`
- Entity fields use `selector: { entity: { filter: { domain: [...] } } }`
- `computeLabel` and `computeHelper` must be class-property arrow functions
  (not regular methods) to avoid rebinding on every render
- `ha-selector` with entity type auto-initialises when connected to the DOM.
  Do not place it inside a collapsed `ha-expansion-panel` with event handlers —
  it can fire spurious `value-changed` events during init

---

## Config Schema

```typescript
interface WizardClockCardConfig {
  type: string;
  wizards: WizardConfig[];      // required, at least one
  locations?: string[];          // ordered zone name list
  lost?: string;                 // default "Lost"
  travelling?: string;           // default "Travelling"
  min_location_slots?: number;
  header?: string;
  fontName?: string;             // CSS font-family
  fontface?: string;             // raw @font-face CSS (expert)
  shaft_colour?: string;         // hex or named colour
  exclude?: string[];
}

interface WizardConfig {
  entity: string;                // person/device_tracker/calendar entity ID
  name: string;                  // display name on clock hand
  colour?: string;               // hand colour (hex or named)
  textcolour?: string;           // name label colour (hex or named)
  proximity_sensor?: string;     // Proximity integration direction-of-travel entity
}
```

---

## Commit and PR Hygiene

- Write commit messages as descriptions of what the code **is**, not what
  changed. Non-trivial commits need a body paragraph per major component
  describing what it does, key decisions, and non-obvious constraints.
- Incremental local commits are fine for rollback, but squash before pushing.
  What reaches the remote reflects the final complete state of the work.
- **Wait for explicit human approval before committing** when the change
  includes UI behaviour requiring visual verification in HA. Report what changed
  and what to look at, then wait.
- Do not bundle unrelated changes in a single commit.
- When writing `gh pr create` or `gh pr edit` bodies with backticks, use
  `PREOF` (not `EOF`) as the heredoc delimiter to avoid shell interpretation.

---

## Pre-push Verification

- Run `npm run build:dev` before pushing during feature work
- Only run `npm run build` and `nix build` when cutting a release
- Run `nix build` when `flake.nix`, `package.json`, or `package-lock.json`
  changes (release time only)
- Verify before reporting success — do not assume correctness because the code
  looks right

---

## Git Branch Workflow

- Current feature branch: `ui-v2` (visual card editor work)
- Main branch: `master`
- Start new work from a fresh master: `git checkout master && git pull`, then
  `git checkout -b <branch-name>`
- Delete merged branches locally after the PR merges

---

## Infrastructure Preferences

- Self-hosted over cloud; open-source over proprietary; self-sovereign data
- Avoid patterns where owner's data is in third-party custody without a
  compelling reason
- Least complex solution that meets requirements
