# Weasley Wizarding Clock Card

A Harry Potter-style Weasley family clock for Home Assistant Lovelace. Family
members appear as animated clock hands pointing to their current location zone.

<img src="example.png" alt="Example Weasley clock" width="400">

> **Maintained fork** of [malcolmrigg/wizard-clock-card](https://github.com/malcolmrigg/wizard-clock-card).
> Changes are contributed upstream where possible. This fork is actively
> maintained in the interim.

For installation instructions and the full config reference, see the
[HACS store page](https://my.home-assistant.io/redirect/hacs_repository/?owner=genebean&repository=weasley-wizarding-clock-card)
or [info.md](info.md).

---

## Development

This project uses a [Nix](https://nixos.org/) dev shell. All tooling runs
inside `nix develop`. Never install node, npm, or esbuild on the host directly.

```bash
# Enter the dev shell
nix develop

# Install npm dependencies (first time, or after package.json changes)
npm install

# Build for local HA dev card (element: weasley-wizarding-clock-card-dev)
npm run build:dev

# Build for release / HACS (element: weasley-wizarding-clock-card)
npm run build

# Build with upstream element name (element: wizard-clock-card)
npm run build:upstream

# Type check without emitting files
npm run typecheck

# Watch and rebuild on changes (dev build)
npm run watch:dev
```

### Dev card setup

The dev build registers the element as `weasley-wizarding-clock-card-dev`, allowing it
to coexist with the installed production card on the same HA instance:

1. Copy `weasley-wizarding-clock-card-dev.js` to `config/www/`
2. Add it as a resource: `/local/weasley-wizarding-clock-card-dev.js`
3. Use `type: custom:weasley-wizarding-clock-card-dev` in a test dashboard card

### Upstream-compatible build

To produce a build with the upstream element name for contributing back:

```bash
npm run build:upstream   # → wizard-clock-card.js with element: wizard-clock-card
```

This file is gitignored — it's only for testing compatibility or preparing
upstream PRs. Do not commit it.

---

## Project structure

```
src/
  weasley-wizarding-clock-card.ts        # Main card element (LitElement + canvas)
  weasley-wizarding-clock-card-editor.ts # Visual card editor element
weasley-wizarding-clock-card.js          # Production build — committed, used by HACS
flake.nix                                # Nix dev shell + nix build package
package.json                             # npm scripts (build, build:dev, typecheck, etc.)
tsconfig.json
AGENTS.md                                # Architecture, conventions, and agent guidance
```

---

## Contributing

See [AGENTS.md](AGENTS.md) for architecture details, coding conventions, commit
message guidance, and the ha-expansion-panel patterns that must be followed in
the editor.

Before pushing, run:

```bash
nix develop --command npm run build:dev   # verify dev build
nix develop --command npm run typecheck   # verify types
```

---

## Upstream

This fork tracks [malcolmrigg/wizard-clock-card](https://github.com/malcolmrigg/wizard-clock-card).
