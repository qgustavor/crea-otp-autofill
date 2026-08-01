# Build instructions

These instructions reproduce the exact `dist/extension/` contents that
were submitted to addons.mozilla.org, from the source files in this
package, for anyone auditing the build (in particular, AMO reviewers —
see `REVIEWER_NOTES.md`).

## Requirements

- [Bun](https://bun.sh/) 1.0 or later. No other runtime is needed; the
  build script (`build.mjs`) itself runs on Node-compatible APIs and
  works under Bun.
- Network access to the public npm registry, to install the exact
  versions pinned in `bun.lock` (`esbuild`, `eslint`, `neostandard`).
  No dependency is vendored, prebuilt, or modified from its published
  form.

## Steps

```bash
# 1. Install dependencies exactly as pinned in bun.lock
bun install --frozen-lockfile

# 2. Build the Firefox extension target
bun run build:extension
```

This produces:

```
dist/extension/
├── manifest.json   # same as src/extension/manifest.json, with the
│                   # "0.0.0" placeholder version replaced by the
│                   # version field from package.json
├── content.js      # esbuild bundle of src/extension/content.js and
│                   # everything it imports from src/core/
└── content.js.map  # source map for content.js (not minified, but
                    # bundled/concatenated — see REVIEWER_NOTES.md)
```

Zip the contents of `dist/extension/` (not the folder itself) to get
the exact `.xpi`-ready package.

To build the user-script instead (not distributed through AMO, but part
of the same source tree):

```bash
bun run build:userscript
# -> dist/userscript/crea-otp-autofill.user.js
```

## Verifying the build is reproducible

```bash
bun run lint       # neostandard/eslint, should report zero issues
bun run build      # builds both targets
```

The build is deterministic given the same `bun.lock` and Bun/esbuild
versions: no timestamps, random values, or network calls happen at
build time (the only runtime randomness — the 256-bit token in
`src/core/crypto.js` — is generated in the user's browser at first run,
never at build time).
