/**
 * Communication with the Google Apps Script endpoint.
 *
 * In the user script we use GM_xmlhttpRequest (allows cross-origin requests).
 * In the extension we use fetch (allowed via manifest permissions).
 */

/**
 * Fetches the OTP code from the configured endpoint.
 *
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern — Obfuscated CREA email pattern (e.g., "ex***le@g***.com")
 * @returns {Promise<string|null>} — The 6-digit code, or null if not found.
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

/** Uses GM_xmlhttpRequest (user script) */
function fetchViaGM (url) {
  return new Promise(resolve => {
    GM_xmlhttpRequest({ // eslint-disable-line no-undef
      method: 'GET',
      url,
      onload: res => {
        try {
          const data = JSON.parse(res.responseText)
          resolve(data.code || null)
        } catch {
          resolve(null)
        }
      },
      onerror: () => resolve(null)
    })
  })
}

/** Uses fetch (extension) */
async function fetchViaFetch (url) {
  try {
    const res = await fetch(url)
    const data = await res.json()
    return data.code || null
  } catch {
    return null
  }
}
