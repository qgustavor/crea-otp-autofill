# CREA-GO OTP Autofill

Automatic OTP ("two-step" verification) code filling for the [CREANET](https://creanet.crea-go.org.br/) portal of CREA-GO (Regional Council of Engineering and Agronomy of Goiás, Brazil).

> [🇧🇷 Versão em português](README.md)

## What it does

When you log in to CREANET, the system sends a 6-digit verification code via email. This project automatically reads that code from your Gmail and fills in the form for you — no need to open your email.

It's useful for frequent logins or for secure access delegation (allowing someone to use a CREA account without having direct access to the email inbox).

## How to use

### 1. Install the extension or user-script

| Browser | Method |
|---------|--------|
| **Firefox** (and forks) | Install the [Firefox extension](../../releases/latest) |
| **Chrome, Edge, etc.** | Install a user-script manager ([Violentmonkey](https://violentmonkey.github.io/), [Tampermonkey](https://www.tampermonkey.net/)), then install the [user-script](../../releases/latest/download/crea-otp-autofill.user.js) |

### 2. Log in to CREA

On the verification code screen, the system detects your email and offers the option to set up automatic filling. Just follow the on-screen steps.

That's it. On the next login, the code will be filled in automatically.

## How it works

The system has two components:

1. **Extension/user-script** (runs in your browser): detects CREA's verification screen and fills in the code automatically.
2. **Google Apps Script** (runs in your Google account): a small script that reads the CREA email and returns the OTP code when requested by the browser.

On first use, the system guides you through creating the Apps Script in your Google account. No programming required — just copy the generated code, paste it into Google Apps Script, and share the URL back.

## Security

### Threat model

The OTP code alone is useless without the CREA account password. Even in a total leak scenario (someone obtains the endpoint + token), the most they could get is the last OTP code generated.

### Measures

- **Credential encryption**: credentials for the Apps Script API returning the OTP are stored in an encrypted state using the user's login identification (CPF or CNPJ). This encryption prevents anyone from retrieving the OTP unless they possess the user's credentials (their CPF or CNPJ number).
- **Token authentication**: the Apps Script endpoint requires a 256-bit token generated locally in the browser. Without the correct token, the endpoint returns an error.
- **Isolated storage**: encrypted credentials (endpoint URL + token) are stored in the extension's or user-script manager's internal storage. They are not exposed in the source code.
- **Encryption in transit**: all communications use HTTPS (Google Apps Script requires HTTPS).
- **Minimal scope**: the Apps Script only has permission to read Gmail emails. It never modifies, sends, or deletes anything.
- **Open source**: all code is public and auditable.

### Technical details

For those who want to audit or understand the internal mechanisms:

- Local credential encryption uses PBKDF2 with 100,000 rounds for key derivation derived from the user's CPF/CNPJ, combined with AES-GCM for data encryption.
- Tokens are generated with `crypto.getRandomValues(new Uint8Array(32))` and hex-encoded (64 characters, 256 bits of entropy). This is the W3C-recommended standard mechanism for generating cryptographically secure values in browsers.
- In the user-script, storage uses the `GM_getValue` / `GM_setValue` APIs from the script manager (Tampermonkey, Violentmonkey, etc.), which isolate data per script.
- In the extension, it uses `browser.storage.local`, which is isolated per extension and inaccessible to web pages.

## Multiple accounts

Each configuration is associated with the email pattern that CREA shows on the login screen (e.g., `ex***le@g***.com`). You can configure as many accounts as you want — each with its own Apps Script.

## Development

### Requirements

- Bun 1.0+

### Setup

```bash
git clone https://github.com/qgustavor/crea-otp-autofill.git
cd crea-otp-autofill
bun install
```

### Build

```bash
bun run build            # Build everything
bun run build:userscript # User-script only
bun run build:extension  # Extension only

bun run watch            # Rebuild on save
```

Compiled files go to `dist/`:

```
dist/
├── userscript/
│   └── crea-otp-autofill.user.js   ← User-script ready to install
└── extension/
    ├── manifest.json
    └── content.js                   ← Extension ready to load
```

### Lint

The project uses [neostandard](https://github.com/neostandard/neostandard):

```bash
bun run lint
bun run lint:fix
```

### Code structure

```
src/
├── core/                        ← Shared code (user-script + extension)
│   ├── main.js                  ← Main logic and orchestration
│   ├── storage.js               ← Storage abstraction (GM_* vs browser.storage)
│   ├── crypto.js                ← Tokens and encryption
│   ├── fetcher.js               ← Apps Script communication
│   ├── apps-script-template.js  ← Apps Script code generator
│   └── ui.js                    ← Setup wizard and messages UI
├── userscript/
│   └── entry.js                 ← User-script entry point
└── extension/
    ├── content.js               ← Extension entry point
    └── manifest.json
```

The build uses [esbuild](https://esbuild.github.io/), which compiles each entry point into a single file, automatically resolving imports from `core/`. This avoids code duplication between the two distribution methods.

### Testing the extension in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/extension/manifest.json`

### Releases

Releases are automated via GitHub Actions. To publish a new version:

1. Increment the version and generate the release tag automatically:
   ```bash
   bun pm version patch   # or minor / major
   ```
2. Push the commit and tag to GitHub:
   ```bash
   git push --follow-tags
   ```
3. CI builds the project and creates the release with the ready-to-use files.

## Contributing

This project was developed with the help of [Claude](https://claude.ai/) (Anthropic) and [Gemini](https://aistudio.google.com/) (Google). Contributions, issues, and suggestions are welcome.

## License

[MIT](LICENSE)
