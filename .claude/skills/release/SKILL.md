---
description: Run the full release workflow for weasley-wizarding-clock-card — version bumps, hash, tag, and GitHub release
---

Execute the release workflow exactly. Do not skip or reorder steps.

## Pre-release (before opening the PR)

### Step 1 — Confirm the version number

Ask the owner for the new version (e.g. `0.12.0`) if not already provided.
All files must end up with matching versions.

### Step 2 — Bump versions in all files

Edit these in a single commit — all must match:

- `package.json` → `"version"` field
- `package-lock.json` → TWO places:
  - Top-level `"version"` field
  - The `""` packages entry `"version"` field
  - WARNING: Missing the second location is a common mistake — check both.
- `flake.nix` → `version` attribute
- `src/weasley-wizarding-clock-card.ts` → `VERSION` constant

Also check `package-lock.json` `"name"` field — must be `weasley-wizarding-clock-card`.

### Step 3 — Recompute npmDepsHash

    nix run nixpkgs#prefetch-npm-deps package-lock.json

Copy the printed `sha256-...` value into `flake.nix` as `npmDepsHash`.
This must be done any time `package-lock.json` changes — including a version-only bump.

### Step 4 — Build the prod JS and verify

    nix develop --command npm run build

Confirm `weasley-wizarding-clock-card.js` is updated and type-checks pass:

    nix develop --command npm run typecheck

### Step 5 — Commit everything

Single commit, all changed files:

    chore: release vX.Y.Z

### Step 6 — Tag locally only

    git tag vX.Y.Z

WARNING: Do NOT push the tag yet. Pushing the tag triggers the release workflow
on a moving target if CI hasn't passed.

### Step 7 — Open the PR

Wait for CI to pass. If `nix build` fails with a hash mismatch:
1. Re-run `prefetch-npm-deps`
2. Amend the commit with the corrected hash
3. Re-tag: `git tag -f vX.Y.Z`
4. Force-push: `git push --force-with-lease`

---

## Post-merge

### Step 8 — Pull main

    git checkout main && git pull

### Step 9 — Push the tag

    git push origin vX.Y.Z

WARNING: Do NOT use `git push --tags` — push only the specific tag by name.
Pushing the tag triggers the release workflow, which builds `weasley-wizarding-clock-card.js`
and attaches it to the GitHub release automatically.

### Step 10 — Create the GitHub release

    gh release create vX.Y.Z \
      --repo genebean/weasley-wizarding-clock-card \
      --title "vX.Y.Z" \
      --generate-notes

The release workflow will attach `weasley-wizarding-clock-card.js` to it within ~1 minute.
HACS users will then see the update.

### Step 11 — Clean up

Delete the local release branch:

    git branch -d release/vX.Y.Z

---

## Checklist

- [ ] Version bumped in `package.json`
- [ ] Version bumped in BOTH places in `package-lock.json`
- [ ] Name is `weasley-wizarding-clock-card` in BOTH places in `package-lock.json`
- [ ] Version bumped in `flake.nix`
- [ ] Version bumped in `src/weasley-wizarding-clock-card.ts` (`VERSION` constant)
- [ ] `npmDepsHash` recomputed and updated in `flake.nix`
- [ ] `weasley-wizarding-clock-card.js` rebuilt (prod build)
- [ ] `npm run typecheck` passes
- [ ] Single `chore: release vX.Y.Z` commit
- [ ] Tag created locally (not pushed)
- [ ] PR open and CI green
- [ ] After merge: main pulled, tag pushed by name, GitHub release created, branch deleted
