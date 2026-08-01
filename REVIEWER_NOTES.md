# Notes for AMO reviewers

This file is written for the person reviewing this extension on
addons.mozilla.org. It is not shown to end users. A shortened version of
it is submitted automatically as the version's "approval notes" by the
release workflow (`.github/workflows/release.yml`); this full copy lives
in the repository for reference.

## What the extension does

CREA-GO OTP Autofill fills in the 6-digit email verification code shown
by the CREANET portal (`creanet.crea-go.org.br`) — a login/OTP screen for
a Brazilian professional council. The code normally has to be copied by
hand from an email; this extension retrieves it automatically from an
endpoint the *user themselves* deploys under their own Google account
(a Google Apps Script Web App that reads their own Gmail) and fills the
form field for them.

There is no functionality beyond this single purpose, and no code path
is reachable from anywhere other than the two matched URLs.

## Source code / build process

The extension is bundled with [esbuild](https://esbuild.github.io/) from
several ES module source files under `src/core/` and `src/extension/`.
The code is **not minified** (no `minify` option is set — see
`build.mjs`), but because it is bundled and uses `define`-based build
constants, we are attaching a full source package per the "Source code
submission" policy.

- Full source: `source-code.zip`, attached as a release asset by the
  same CI run that produced this submission.
- Build instructions: `BUILD_INSTRUCTIONS.md` inside that zip (also
  reproduced below).
- Toolchain: [Bun](https://bun.sh/) 1.0+, using only packages resolved
  from the public npm registry via the committed `bun.lock`. No
  vendored, prebuilt, or hand-modified dependency exists in the repo.
- All devDependencies (`esbuild`, `eslint`, `neostandard`) are
  build-time only; none of their code is bundled into `content.js`
  except esbuild's own (unmodified, unminified) runtime for the IIFE
  wrapper, which esbuild itself emits.

```
bun install --frozen-lockfile
bun run build:extension
# output: dist/extension/{manifest.json, content.js, content.js.map}
```

The version-numbered zip that was submitted to AMO is exactly the
contents of `dist/extension/` after this command, with `manifest.json`'s
version field populated by the build script from `package.json`.

## Permission justification

| Manifest entry | Why it's requested |
|---|---|
| `permissions: ["storage"]` | Stores the (encrypted) endpoint URL + token needed to reach the user's own Apps Script, and the wizard/setup state. Nothing here is sent anywhere by the extension itself. |
| `permissions: ["https://script.google.com/*"]` | The only remote host the extension ever talks to. It calls the user's own Apps Script Web App (always hosted under this domain by Google) to retrieve the OTP. No other origin is contacted. |
| `content_scripts.matches: ["https://creanet.crea-go.org.br/*"]` | The only page the content script runs on — the CREA-GO login/verification flow it automates. |

No `<all_urls>`, no background/persistent scripts, no remote code
execution, no analytics/telemetry of any kind.

## Data collection disclosure

`browser_specific_settings.gecko.data_collection_permissions` declares
`authenticationInfo` as required, because the extension's entire purpose
is to request and receive a one-time authentication code from a remote
endpoint. To be precise about what that involves:

- What leaves the browser: a locally-generated random 256-bit token
  (see `src/core/crypto.js`) and an already-redacted email pattern
  (e.g. `ex***le@g***.com`, as shown by CREA's own UI) sent to the
  user's own Apps Script URL.
- What comes back: the OTP code and its timestamp.
- Nothing is sent to the developer, to Anthropic/Google/Mozilla, or to
  any third party other than the endpoint the user personally created
  and controls. See `PRIVACY.md` / `PRIVACY.en.md` for the full,
  user-facing explanation, and the "Segurança" / "Security" sections of
  `README.md` / `README.en.md` for the threat model.

## Third-party libraries

None are bundled at runtime. `esbuild`, `eslint`, and `neostandard` are
devDependencies used only to produce `dist/`; their own code is not
included in the shipped `content.js` (beyond esbuild's minimal,
unmodified IIFE bootstrap, which contains no third-party logic).

## Companion Google Apps Script

Users are guided (in-extension, via the setup wizard) to paste a
generated script into their own Google Apps Script project. That script
is not part of this extension's package — it runs entirely under the
user's own Google account and is authored to their account, not
Mozilla's or ours. Its source is in this repository at
`src/core/apps-script-source.js` for anyone who wants to audit it before
pasting it in.
