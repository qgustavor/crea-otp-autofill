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
 */

import { getAccount, setAccount, listAccounts, removeAccount } from './storage.js'
import { generateToken } from './crypto.js'
import { generateAppsScriptCode } from './apps-script-template.js'
import { fetchOTP } from './fetcher.js'
import {
  STYLES,
  setLoadingMessage,
  showInlineMessage,
  showSetupWizard,
  showManagePanel
} from './ui.js'

const MAX_DURATION = 40_000 // 40 seconds in total
const RETRY_INTERVAL = 4_000 // Retry every 4 seconds
const EMAIL_DETECTION_TIMEOUT = 10_000 // 10 seconds to detect the email pattern

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

  // Adds a wait message to the CREA loading screen
  setLoadingMessage('Aguarde…')

  // Checks if we are on the OTP validation page
  // Waits a bit for the CREA Angular to render the fields
  const isOTPPage = await waitForElement('#digito1', 3000)
  if (!isOTPPage) {
    // Not the OTP screen — might be the regular login screen
    injectSettingsButton()
    return
  }

  injectSettingsButton()
  await run()
}

/**
 * Injects a discreet settings button into the page.
 */
function injectSettingsButton () {
  if (!document.body) return

  const btn = document.createElement('div')
  
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
  btn.title = 'CREA OTP Autofill — Configurações'
  
  // Placed on the right side with z-index: 9998 so it stays hidden behind CREA's #loading-screen (z-index: 9999)
  btn.style.cssText = `
    position: fixed !important; bottom: 12px !important; right: 12px !important; z-index: 9998 !important;
    width: 36px !important; height: 36px !important; border-radius: 50% !important;
    background: rgba(255,255,255,0.9) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    cursor: pointer !important; color: #555 !important;
    transition: transform 0.15s !important;
  `
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.15)' })
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)' })
  btn.addEventListener('click', openSettings)
  document.body.appendChild(btn)
}

/**
 * Opens the account management panel.
 */
async function openSettings () {
  const accounts = await listAccounts()
  showManagePanel(accounts, async emailPattern => {
    await removeAccount(emailPattern)
  })
}

/**
 * Main OTP autofill flow.
 */
async function run () {
  // 1. Detects the email pattern on the screen
  const emailPattern = await detectEmailPattern()

  if (!emailPattern) {
    hideLoadingScreen()
    showInlineMessage(
      'Não foi possível detectar o e-mail na página. ' +
      'O CREA pode ter alterado a interface. ' +
      'Tente atualizar a extensão/user-script ou preencha o código manualmente.'
    )
    return
  }

  // 2. Checks if there is a configured endpoint
  let config = await getAccount(emailPattern)

  // Also tries by domain (for manual domain configurations)
  if (!config) {
    const domain = emailPattern.split('@').at(-1)
    if (domain) config = await getAccount(domain)
  }

  if (!config) {
    hideLoadingScreen()
    showInlineMessage(
      `O preenchimento automático não está configurado para <strong>${emailPattern}</strong>.`,
      {
        actionLabel: 'Configurar agora',
        onAction: () => startSetup(emailPattern)
      }
    )
    return
  }

  // 3. Fetches the OTP code
  setLoadingMessage('Buscando código…')
  await pollForCode(config, emailPattern)
}

/**
 * Waits for the obfuscated email pattern to appear on the CREA screen.
 * @returns {Promise<string|null>}
 */
async function detectEmailPattern () {
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

/**
 * Starts the setup wizard for an email pattern.
 * @param {string} emailPattern
 */
async function startSetup (emailPattern) {
  // Removes previous message
  document.querySelector('.coaf-msg')?.remove()

  // Automatically generates a security token
  const token = generateToken()

  // Generates the Apps Script code with the embedded token
  const scriptCode = generateAppsScriptCode(token)

  // Opens the wizard
  const result = await showSetupWizard(emailPattern, scriptCode, token)

  if (result) {
    // Saves the configuration
    await setAccount(emailPattern, result)

    // Shows feedback and starts fetching
    showInlineMessage('Configuração salva! Buscando código…')
    setLoadingMessage('Buscando código…')
    await pollForCode(result, emailPattern)
  }
}

/**
 * Fetches the OTP code in a loop until found or expired.
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern
 */
async function pollForCode (config, emailPattern) {
  const startTime = Date.now()

  while (Date.now() - startTime < MAX_DURATION) {
    const code = await fetchOTP(config, emailPattern)

    if (code) {
      fillAndSubmit(code, config, emailPattern)
      return
    }

    await sleep(RETRY_INTERVAL)
  }

  // Time's up (timeout)
  hideLoadingScreen()
  showInlineMessage(
    'Não foi possível encontrar o código a tempo. ' +
    'Verifique se o e-mail do CREA chegou na sua caixa de entrada e tente novamente.'
  )
}

/**
 * Fills in the OTP fields and clicks "Validar" (Validate).
 * @param {string} code
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern
 */
function fillAndSubmit (code, config, emailPattern) {
  for (let i = 0; i < 6; i++) {
    const input = document.querySelector('#digito' + (i + 1))
    if (!input) continue
    input.value = code.charAt(i)
    input.dispatchEvent(new Event('change'))
    input.dispatchEvent(new Event('input'))
  }

  const btn = document.querySelector('#botaoValidar')
  if (btn) {
    btn.disabled = false
    btn.click()
  }

  hideLoadingScreen()

  // Checks if the code was rejected (CREA displays "inválido")
  watchForInvalidCode(config, emailPattern)
}

/**
 * Observes if CREA rejects the code and tries again.
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern
 */
async function watchForInvalidCode (config, emailPattern) {
  for (let i = 0; i < 30; i++) {
    await sleep(1000)

    if (document.body?.textContent?.includes('inválido')) {
      setLoadingMessage('Código rejeitado, tentando novamente…')
      return pollForCode(config, emailPattern)
    }

    // If we are no longer on the OTP page, login was successful
    if (!document.querySelector('#digito1')) return
  }
}

/**
 * Hides the CREA loading screen, releasing our lock so the original 
 * layout/inline styles can take effect.
 */
function hideLoadingScreen () {
  const screen = document.getElementById('loading-screen')
  if (screen) {
    screen.classList.remove('coaf-force-loading')
    screen.style.display = 'none'
  }
}

/**
 * Waits for an element to appear in the DOM.
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<Element|null>}
 */
async function waitForElement (selector, timeout) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector)
    if (el) return el
    await sleep(100)
  }
  return null
}

/** @param {number} ms */
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
