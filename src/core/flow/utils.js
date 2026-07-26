/**
 * Small generic helpers with no CREA-specific knowledge.
 */

/** @param {number} ms */
export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Waits for an element to appear in the DOM.
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<Element|null>}
 */
export async function waitForElement (selector, timeout) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector)
    if (el) return el
    await sleep(100)
  }
  return null
}
