/**
 * Reads data from CREA's own session, and tracks when the user submitted
 * the login form — used as the "don't trust codes older than this" bound
 * described in ./otp-flow.js.
 */

const LOGIN_TIME_KEY = 'coaf-login-time'

/**
 * Reads the user's CPF/CNPJ from the CREA session, used as the encryption
 * passphrase for stored credentials.
 * @returns {string | null}
 */
export function getCPF () {
  try {
    const encoded = sessionStorage.getItem('creanet')
    if (!encoded) return null
    return atob(encoded)
  } catch {
    return null
  }
}

/**
 * Called on the /usuario/login page: records the moment the user submits
 * the login form. This is the earliest possible instant CREA could have
 * sent an OTP e-mail for *this* login attempt, so it's the baseline used
 * on the OTP page to reject stale codes (e.g. a code from a login attempt
 * made a few minutes earlier, which Gmail's search would still surface).
 */
export function recordLoginAttemptTime () {
  try {
    sessionStorage.setItem(LOGIN_TIME_KEY, String(Date.now()))
  } catch {
    // sessionStorage unavailable (private mode, quota, etc.) — the OTP
    // page will fall back to its own load time instead.
  }
}

/**
 * Called on the /usuario/valida-login page: returns the timestamp beyond
 * which OTP codes are considered valid for this attempt.
 *
 * Falls back to "now" if we don't have a recorded login-click time (e.g.
 * the user navigated here directly, or reloaded this page). That's a
 * slightly less accurate bound — it can't tell a code sent a second ago
 * from one sent a minute ago before that point — but it's still strictly
 * better than not checking at all, and never rejects a code from *this*
 * attempt.
 * @returns {number} epoch milliseconds
 */
export function getMinCodeTimestamp () {
  try {
    const stored = sessionStorage.getItem(LOGIN_TIME_KEY)
    const parsed = stored ? Number(stored) : NaN
    if (Number.isFinite(parsed)) return parsed
  } catch {
    // ignore, fall through to the default below
  }
  return Date.now()
}
