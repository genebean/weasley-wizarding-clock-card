{
  description = "Weasley Clock Card — Harry Potter-style location clock for Home Assistant";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {

        # `nix fmt` — format all Nix files in the tree using nixfmt
        formatter = pkgs.nixfmt-tree;

        # `nix build` — produces weasley-clock-card.js in result/
        packages.default = pkgs.buildNpmPackage {
          pname = "weasley-clock-card";
          version = "0.10.0";
          src = ./.;
          nodejs = pkgs.nodejs_24;

          # Recompute this hash after any package-lock.json change:
          #   nix run nixpkgs#prefetch-npm-deps package-lock.json
          npmDepsHash = "sha256-d/OVc9Hpb5NINuZKmu6JiFque5sCl8Z6oq84oGxYlmw=";

          buildPhase = "npm run build";
          installPhase = ''
            mkdir -p $out
            cp weasley-clock-card.js $out/
          '';
        };

        # `nix develop` — dev shell for local development.
        # ALL npm / npx commands MUST run inside this shell.
        # TypeScript and esbuild are npm devDependencies, invoked via npm scripts.
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            deadnix # Nix dead-code linter — used by pre-commit hook
            nixfmt-tree # Nix formatter — used by `nix fmt` and pre-commit
          ];
          shellHook = ''
            if [[ $- == *i* ]]; then
              echo "Weasley Clock Card dev shell"
              echo ""
              echo "  npm install           — install dependencies (first time or after package.json changes)"
              echo "  npm run build         — compile → weasley-clock-card.js  (published/HACS build)"
              echo "  npm run build:dev     — compile → weasley-clock-card-dev.js  (local HA dev card)"
              echo "  npm run build:upstream — compile → wizard-clock-card.js  (upstream-compatible name)"
              echo "  npm run typecheck     — TypeScript type check without emitting files"
              echo "  npm run watch:dev     — rebuild weasley-clock-card-dev.js on file changes"
              echo ""
              echo "  After changing package-lock.json, update npmDepsHash in flake.nix:"
              echo "    nix run nixpkgs#prefetch-npm-deps package-lock.json"
            fi
          '';
        };

      }
    );
}
