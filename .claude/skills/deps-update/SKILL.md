---
description: Evaluate and combine Renovate dependency update PRs for weasley-wizarding-clock-card
---

Execute this workflow when Renovate has opened one or more dependency update PRs and the user wants to combine them.

## Step 1 — Review open Renovate PRs

List open PRs and identify Renovate dep-update PRs:

    gh pr list --repo genebean/weasley-wizarding-clock-card

For each dep PR, note the PR number and the dependency being bumped.

## Step 2 — Research breaking changes

Before combining, verify each upgrade is safe. Use the context7 MCP (`mcp__plugin_context7-plugin_context7__resolve-library-id` + `query-docs`) or web search to check changelogs/migration guides. Key things to verify:

- Are any APIs we use removed or renamed?
- Are there new required configuration changes (e.g. tsconfig options)?
- Are transitive dependency warnings introduced? (warn user but don't block)

For this project's specific deps:
- **esbuild**: check for build-API or CLI flag changes
- **typescript**: check tsconfig breaking changes; our `tsconfig.json` options are explicit, `skipLibCheck: true` is set
- **custom-card-helpers**: check if `HomeAssistant` and `LovelaceCardEditor` are still exported; we only read from `hass`

## Step 3 — Get the commit SHAs

For each Renovate PR, get the merge commit SHA of the branch tip (not the PR merge commit on main):

    gh pr view <PR#> --repo genebean/weasley-wizarding-clock-card --json headRefOid

## Step 4 — Create the combine branch

    git checkout main && git pull
    git checkout -b chore/combine-renovate-deps

## Step 5 — Cherry-pick each commit

Cherry-pick in dependency order (least likely to conflict first):

    git cherry-pick <sha1> <sha2> <sha3>

If a cherry-pick conflicts (common in `package-lock.json` and `package.json` when two PRs both touch devDependencies):

1. Open the conflicted file — it will have `<<<<<<< HEAD`, `|||||||`, `=======`, `>>>>>>>` markers
2. The `HEAD` side has the already-applied updates; the `>>>>>>>` side has the new update
3. Keep ALL the version bumps from both sides — merge them manually
4. `git add <file>` then `git cherry-pick --continue --no-edit`

Repeat for each commit.

## Step 6 — Update npmDepsHash

Any package-lock.json change requires recomputing the Nix hash:

    nix run nixpkgs#prefetch-npm-deps package-lock.json

Copy the printed `sha256-...` value into `flake.nix` as `npmDepsHash`.

## Step 7 — Install, typecheck, build

    nix develop --command npm ci
    nix develop --command npm run typecheck
    nix develop --command npm run build

## Step 8 — Run pre-commit and commit

    pre-commit run -a

Fix any auto-fixed files (pre-commit modifies them in place, just re-stage), then commit:

    git add flake.nix weasley-wizarding-clock-card.js
    git commit -m "chore: update npmDepsHash and rebuild JS after dep bumps"

## Step 9 — Push and open PR

    git push -u origin chore/combine-renovate-deps

Open the PR with:
- Title: `chore: combine Renovate dep updates (<dep1>, <dep2>, ...)`
- Body: bullet list of each bump with inline PR link (e.g. `- Bumps foo ^1.0 → ^2.0 (#10)`)
- Safety notes for any non-trivial upgrades
- Test plan: CI passes

## Step 10 — After merge

    git checkout main && git pull
    git branch -d chore/combine-renovate-deps

Close the individual Renovate PRs if they weren't auto-closed (GitHub usually auto-closes them when main moves past their changes).

---

## Checklist

- [ ] All Renovate PRs reviewed for breaking changes
- [ ] Cherry-picks applied cleanly (conflicts resolved by merging both sides)
- [ ] `npmDepsHash` updated in `flake.nix`
- [ ] `npm ci` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `pre-commit run -a` passes
- [ ] Commit with updated `flake.nix` and rebuilt JS
- [ ] PR open with inline issue links (not "Closes")
- [ ] After merge: main pulled, local branch deleted
