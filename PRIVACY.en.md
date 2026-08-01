# Privacy Policy

> [🇧🇷 Versão em português](PRIVACY.md)

This extension/user-script ("CREA-GO OTP Autofill") isn't operated by any
company — it's an open-source project, and it doesn't collect or send
data to its author, to Mozilla, to Google, or to any third party other
than the service **you** create and control.

## What is stored

Locally, in the extension's internal storage (`browser.storage.local`)
or the user-script manager's (`GM_setValue`), isolated per extension/
script and inaccessible to web pages:

- Your Apps Script URL and authentication token, always encrypted with
  AES-256-GCM using a key derived from your CPF/CNPJ (see
  `src/core/crypto.js`).
- The masked email pattern CREA displays (e.g. `ex***lo@g***.com`), used
  only to match the saved configuration to the right account.

None of this ever leaves your browser, except for the request described
below.

## What is transmitted, where, and why

The only network communication the extension makes is an HTTPS request
to `https://script.google.com/*` — specifically, to the Apps Script
*you* deployed under your own Google account. That request sends:

- the locally-generated 256-bit token (not personal data — a random
  secret);
- the already-masked email pattern mentioned above.

And receives back the most recent OTP code (if one was sent within the
last 10 minutes), used to fill in CREA's login form.

No other destination, no other kind of data. There's no telemetry, no
analytics, no network call outside this single purpose.

## Why this shows up as "data collection" on install

Since November 2025, Firefox requires every new extension to declare, in
`manifest.json`, whether it transmits any kind of data — even when that
data never reaches the developer. Because this extension's whole purpose
is to fetch an authentication code from a remote service (your own Apps
Script), it declares the `authenticationInfo` category as required, to
stay transparent about that transmission even though it's to a service
you personally control. See `REVIEWER_NOTES.md` for further technical
detail.

## Questions

Open a [GitHub issue](https://github.com/qgustavor/crea-otp-autofill/issues).
