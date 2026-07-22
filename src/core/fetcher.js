/**
 * Communication with the Google Apps Script endpoint.
 *
 * In the user script we use GM_xmlhttpRequest (allows cross-origin requests).
 * In the extension we use fetch (allowed via manifest permissions).
 *
 * Returns a structured result so the caller can distinguish between:
 *   { code: 'ABC123' }        -> OTP found
 *   { code: null }            -> no code yet (keep polling)
 *   { error: 'unauthorized' } -> token rejected, account should be deleted
 *   { error: 'unexpected' }   -> non-JSON / malformed response
 */
/* global __BUILD_TARGET__, GM_xmlhttpRequest */

/**
 * @typedef {({ code: string | null } | { error: 'unauthorized' | 'unexpected' })} FetchResult
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
  try {
    const data = JSON.parse(text)
    if (data.error === 'unauthorized') {
      return { error: 'unauthorized' }
    }
    if (typeof data.code !== 'undefined') {
      return { code: data.code || null }
    }
    return { error: 'unexpected' }
  } catch {
    return { error: 'unexpected' }
  }
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
