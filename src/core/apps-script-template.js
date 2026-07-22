/**
 * Generates the Google Apps Script code with the authentication token already embedded.
 *
 * The resulting code is a Web App that:
 * 1. Receives a GET request with an authentication token and an email pattern.
 * 2. Verifies that the token is valid.
 * 3. Searches for recent emails from CREA-GO containing a validation code.
 * 4. Returns the OTP code that was found.
 */
import scriptContent from './apps-script-source.js' with { type: 'text' }

/**
 * Generates the Google Apps Script code with the authentication token already embedded.
 *
 * @param {string} token — Automatically generated authentication token.
 * @returns {string} — Complete Apps Script source code, ready to paste.
 */
export function generateAppsScriptCode (token) {
  // Replaces the placeholder with the actual dynamically generated token
  return scriptContent.replace('{{token}}', token)
}
