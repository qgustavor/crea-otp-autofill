/**
 * Controls CREA's own "#loading-screen" element, which we keep visible
 * (and repurpose) while we detect/fetch/fill the OTP code.
 */

/**
 * Adds a message to the CREA loading screen.
 * @param {string} text
 */
export function setLoadingMessage (text) {
  const screen = document.getElementById('loading-screen')
  if (!screen) return

  // Adds a class with 'display: flex !important' to prevent CREA's setTimeout from hiding it
  screen.classList.add('coaf-force-loading')

  let msgEl = document.getElementById('coaf-loading-msg')
  if (!msgEl) {
    msgEl = document.createElement('p')
    msgEl.id = 'coaf-loading-msg'
    // Protects styles against global generic rules
    msgEl.style.cssText = 'color: white !important; font-family: "Open Sans", Arial, sans-serif !important; font-size: 16px !important; margin-top: 18px !important; text-align: center !important;'
    screen.appendChild(msgEl)
  }
  msgEl.textContent = text
}

/**
 * Hides the CREA loading screen, releasing our lock so the original
 * layout/inline styles can take effect.
 */
export function hideLoadingScreen () {
  const screen = document.getElementById('loading-screen')
  if (screen) {
    screen.classList.remove('coaf-force-loading')
    screen.style.display = 'none'
  }
}
