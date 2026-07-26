/**
 * Main logic for CREA-GO OTP Autofill.
 *
 * This module is shared between the user-script and the extension.
 * It coordinates:
 *   1. OTP screen detection.
 *   2. Extraction of the obfuscated email pattern.
 *   3. Verification if an endpoint is configured.
 *   4. Fetching the OTP code.
 *   5. Filling and submitting the form.
 *   6. Displaying errors and the setup wizard.
 *
 * The actual work is split across ./flow (detection/session/polling logic)
 * and ./ui (everything rendered on screen) — this file only wires them
 * together.
 */

import { STYLES, setLoadingMessage } from './ui/index.js'
import { injectSettingsButton } from './flow/settings-button.js'
import { runOTPFlow } from './flow/otp-flow.js'
import { recordLoginAttemptTime } from './flow/session.js'
import { waitForElement } from './flow/utils.js'

/**
 * Entry point. Called by the user-script or extension wrapper.
 * @param {{ addStyle: (css: string) => void }} platform
 */
export async function init (platform) {
  // Injects the interface styles
  platform.addStyle(STYLES)

  // Waits for the DOM to load
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
  }

  const path = window.location.pathname

  if (path === '/usuario/login') {
    // Login page — show the settings button so users can manage accounts,
    // and record the moment the user submits the login form (used on the
    // OTP page to reject stale codes from an earlier attempt).
    injectSettingsButton()
    document.addEventListener('submit', recordLoginAttemptTime, true)
    return
  }

  if (path === '/usuario/valida-login') {
    // OTP validation page — run the auto-fill flow
    setLoadingMessage('Aguarde…')

    // Waits for the CREA Angular to render the OTP fields
    const isOTPPage = await waitForElement('#digito1', 3000)
    if (!isOTPPage) return

    await runOTPFlow()
  }
}
