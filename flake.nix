{
  description = "Wizard Clock Card — Harry Potter-style location clock for Home Assistant";

  inputs = {
    nixpkgs.url     = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {

        # `nix build` — produces wizard-clock-card.js in result/
        packages.default = pkgs.buildNpmPackage {
          pname   = "wizard-clock-card";
          version = "0.9.0";
          src     = ./.;
          nodejs  = pkgs.nodejs_24;

          # Recompute this hash after any package-lock.json change:
          #   nix run nixpkgs#prefetch-npm-deps package-lock.json
          npmDepsHash = "sha256-7qa+nViy2XhxhRH0oPnDtihcOBVdia6HDIyiyKih93E=";

          buildPhase   = "npm run build";
          installPhase = ''
            mkdir -p $out
            cp wizard-clock-card.js $out/
          '';
        };

        # `nix develop` — dev shell for local development.
        # ALL npm / npx commands MUST run inside this shell.
        # TypeScript and esbuild are npm devDependencies, invoked via npm scripts.
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
          ];
          shellHook = ''
            if [[ $- == *i* ]]; then
              echo "Wizard Clock Card dev shell"
              echo ""
              echo "  npm install        — install dependencies (first time or after package.json changes)"
              echo "  npm run build      — compile src/wizard-clock-card.ts → wizard-clock-card.js"
              echo "  npm run watch      — rebuild on file changes"
              echo ""
              echo "  After changing package-lock.json, update npmDepsHash in flake.nix:"
              echo "    nix run nixpkgs#prefetch-npm-deps package-lock.json"
            fi
          '';
        };

      }
    );
}
