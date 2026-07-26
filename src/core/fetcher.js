/**
 * Communication with the Google Apps Script endpoint.
 *
 * In the user script we use GM_xmlhttpRequest (allows cross-origin requests).
 * In the extension we use fetch (allowed via manifest permissions).
 *
 * Returns a structured result so the caller can distinguish between:
 *   { status: 'ok', code, codeTimestamp } -> OTP found, codeTimestamp in ms
 *                                            (epoch), or null if unknown
 *                                            (talking to an older Apps Script)
 *   { status: 'pending' }                 -> no code yet (keep polling)
 *   { error: 'unauthorized' }              -> token rejected, account should be deleted
 *   { error: 'unexpected' }                -> non-JSON / malformed response
 *
 * Apps Script's ContentService always answers with HTTP 200, so it can't
 * signal success/failure via the HTTP status code — the "status" field
 * inside the JSON body plays that role instead.
 */
/* global __BUILD_TARGET__, GM_xmlhttpRequest */

/**
 * @typedef {(
 *   { status: 'ok', code: string, codeTimestamp: number | null } |
 *   { status: 'pending' } |
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
    emailPattern
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

  // Current protocol: explicit "status" field.
  if (typeof data.status === 'string') {
    switch (data.status) {
      case 'unauthorized':
        return { error: 'unauthorized' }
      case 'pending':
        return { status: 'pending' }
      case 'ok':
        if (typeof data.code !== 'string') return { error: 'unexpected' }
        return {
          status: 'ok',
          code: data.code,
          codeTimestamp: typeof data.codeTimestamp === 'number' ? data.codeTimestamp : null
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
      ? { status: 'ok', code: data.code, codeTimestamp: null }
      : { status: 'pending' }
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
