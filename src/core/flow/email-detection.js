/**
 * Detects the obfuscated email pattern CREA displays on the OTP screen
 * (e.g. "ex***le@g***.com"), which we use as the account lookup key.
 */

import { sleep } from './utils.js'

const EMAIL_DETECTION_TIMEOUT = 10_000 // 10 seconds to detect the email pattern

/**
 * Waits for the obfuscated email pattern to appear on the CREA screen.
 * @returns {Promise<string|null>}
 */
export async function detectEmailPattern () {
  const startTime = Date.now()

  while (Date.now() - startTime < EMAIL_DETECTION_TIMEOUT) {
    const el = document.querySelector('strong.ng-binding')
    if (el?.textContent?.includes('***')) {
      return el.textContent.trim()
    }
    await sleep(100)
  }

  return null
}
