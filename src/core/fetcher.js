/**
 * Communication with the Google Apps Script endpoint.
 *
 * In the user script we use GM_xmlhttpRequest (allows cross-origin requests).
 * In the extension we use fetch (allowed via manifest permissions).
 *
 * Returns a structured result so the caller can distinguish between:
 *   { status: 'ok', code, codeTimestamp, apiVersion } -> OTP found, codeTimestamp
 *                                            in ms (epoch), or null if unknown
 *                                            (talking to an older Apps Script)
 *   { status: 'pending', apiVersion }     -> no code yet (keep polling)
 *   { error: 'unauthorized' }              -> token rejected, account should be deleted
 *   { error: 'unexpected' }                -> non-JSON / malformed response
 *
 * Apps Script's ContentService always answers with HTTP 200, so it can't
 * signal success/failure via the HTTP status code — the "status" field
 * inside the JSON body plays that role instead.
 *
 * apiVersion identifies which protocol capabilities the deployed Apps
 * Script supports — see CURRENT_API_VERSION in ../flow/otp-flow.js for
 * how the client decides whether to nudge the user to update it. Scripts
 * that predate this field entirely (the very first protocol) are treated
 * as apiVersion 1.
 */
/* global __BUILD_TARGET__, GM_xmlhttpRequest */

// The protocol version this client build was written against. Sent on
// every request so the Apps Script endpoint can tell if it's running
// code older than what this client expects, and (server-side, see
// apps-script-source.js's notifyIfOutdated) e-mail the account owner
// about it — never something this client tries to detect or warn about
// itself, since whoever's holding this browser may not be the account
// owner (delegated access) and may have no way to act on it anyway.
const CLIENT_API_VERSION = 2

/**
 * @typedef {(
 *   { status: 'ok', code: string, codeTimestamp: number | null, apiVersion: number } |
 *   { status: 'pending', apiVersion: number } |
 *   { error: 'unauthorized' | 'unexpected' }
 * )} FetchResult
 */

/**
 * Fetches the OTP code from the configured endpoint.
 *
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern — Obfuscated CREA email pattern (e.g., "ex***le@g***.com")
 * @returns {Promise<FetchResult>}
 */
export function fetchOTP (config, emailPattern) {
  const params = new URLSearchParams({
    token: config.token,
    emailPattern,
    clientVersion: CLIENT_API_VERSION
  })
  const url = `${config.endpoint}?${params}`

  if (__BUILD_TARGET__ === 'userscript') {
    return fetchViaGM(url)
  }
  return fetchViaFetch(url)
}

/**
 * Parses the raw response text into a structured result.
 * @param {string} text
 * @returns {FetchResult}
 */
function parseResponse (text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { error: 'unexpected' }
  }

  // apiVersion is present on every response since protocol version 2.
  // Its absence (including on the legacy branch below) means version 1.
  const apiVersion = typeof data.apiVersion === 'number' ? data.apiVersion : 1

  // Current protocol: explicit "status" field.
  if (typeof data.status === 'string') {
    switch (data.status) {
      case 'unauthorized':
        return { error: 'unauthorized' }
      case 'pending':
        return { status: 'pending', apiVersion }
      case 'ok':
        if (typeof data.code !== 'string') return { error: 'unexpected' }
        return {
          status: 'ok',
          code: data.code,
          codeTimestamp: typeof data.codeTimestamp === 'number' ? data.codeTimestamp : null,
          apiVersion
        }
      default:
        return { error: 'unexpected' }
    }
  }

  // Legacy protocol, kept for users who haven't redeployed their Apps
  // Script yet. It has no concept of "codeTimestamp", so freshness can't
  // be verified for these responses — codeTimestamp is null, and callers
  // should treat that as "trust it", same as before this feature existed.
  if (data.error === 'unauthorized') return { error: 'unauthorized' }
  if (typeof data.code !== 'undefined') {
    return data.code
      ? { status: 'ok', code: data.code, codeTimestamp: null, apiVersion }
      : { status: 'pending', apiVersion }
  }

  return { error: 'unexpected' }
}

/** Uses GM_xmlhttpRequest (user script) */
function fetchViaGM (url) {
  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: res => resolve(parseResponse(res.responseText)),
      onerror: () => resolve({ error: 'unexpected' })
    })
  })
}

/** Uses fetch (extension) */
async function fetchViaFetch (url) {
  try {
    const res = await fetch(url)
    const text = await res.text()
    return parseResponse(text)
  } catch {
    return { error: 'unexpected' }
  }
}
