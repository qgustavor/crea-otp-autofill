# Releasing

## What ships where

| Artifact | Where it goes | How |
|---|---|---|
| `crea-otp-autofill.user.js` | GitHub Release | every tag |
| Firefox extension | addons.mozilla.org (public listing) | every tag, once Mozilla approves the review |
| Source code package | GitHub Release, `dist/source/source-code.zip` | every tag |

The Firefox extension is only distributed through AMO's public
listing — there's no separate self-hosted `.xpi` on GitHub. Every
tagged version is submitted for AMO's public review automatically;
there's no unlisted/self-distribution path to choose between anymore.

## One-time setup before the first submission

1. **Secrets.** `FIREFOX_API_KEY` / `FIREFOX_API_SECRET` (JWT issuer/
   secret from https://addons.mozilla.org/developers/addon/api/key/)
   must be set as repo secrets.
2. **Icon.** `src/extension/icons/icon.svg` is referenced at
   both `32` and `96` in `manifest.json` (Firefox scales SVG, so one
   file covers both). For the separate AMO **listing** icon (uploaded
   via the Developer Hub, not part of the `.xpi`, PNG/JPEG only), use
   `.amo/listing/icon-128.png` — a 128×128 PNG rendered from the
   same SVG.
3. **Screenshots / longer description.** `.amo/metadata.json`
   only carries the required minimum (summary, category, license,
   approval notes). Once the listing exists, add a fuller description
   and 1–3 screenshots directly on the AMO listing page — `web-ext
   sign` won't manage those for you.
4. **First submission.** Push a tag as described below. Because the
   add-on isn't listed yet, `web-ext sign --channel listed` creates the
   listing itself using `.amo/metadata.json`, and uploads
   `dist/source/source-code.zip` alongside it (see `REVIEWER_NOTES.md`
   for what reviewers will see). This first review is manual on
   Mozilla's side and can take a few days; there's nothing further to
   do but wait, unless they request changes.
5. **Update the README install links.** Both `README.md` and
   `README.en.md` currently point at a placeholder AMO URL
   (`https://addons.mozilla.org/firefox/addon/crea-otp-autofill/`),
   marked with a `TODO` comment — the actual slug is only known once
   the listing exists. Update it (and remove the comment) once you
   have the real one.

## Every subsequent release

```bash
bun pm version patch   # or minor / major
git push --follow-tags
```

The tag push builds both targets, submits the extension to AMO for
review (`--approval-timeout 0`, so the job doesn't sit waiting for
Mozilla to finish reviewing — it just submits and returns), and creates
the GitHub Release with the user-script and the source-code zip.
`.github/amo-metadata.json`'s `categories`/`summary`/`license` fields
only apply to the very first version; later runs only reuse its
`approval_notes`.

## Rolling back a bad release

See Mozilla's [Version Rollback](https://extensionworkshop.com/documentation/publish/version-rollback/)
docs — it's done from the AMO Developer Hub, not from this repo.
