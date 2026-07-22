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

  const path = window.location.pathname

  if (path === '/usuario/login') {
    // Login page — show the settings button so users can manage accounts
    injectSettingsButton()
    return
  }

  if (path === '/usuario/valida-login') {
    // OTP validation page — run the auto-fill flow
    setLoadingMessage('Aguarde…')

    // Waits for the CREA Angular to render the OTP fields
    const isOTPPage = await waitForElement('#digito1', 3000)
    if (!isOTPPage) return

    await run()
  }
}

/**
 * Reads the user's CPF/CNPJ from the CREA session, used as the encryption
 * passphrase for stored credentials.
 * @returns {string | null}
 */
function getCPF () {
  try {
    const encoded = sessionStorage.getItem('creanet')
    if (!encoded) return null
    return atob(encoded)
  } catch {
    return null
  }
}

/**
 * Injects the "CREA OTP Auto-Fill" button on the login page (top-right).
 */
function injectSettingsButton () {
  if (!document.body) return

  const btn = document.createElement('div')

  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    <span>CREA OTP Auto-Fill</span>
  `
  btn.title = 'CREA OTP Auto-Fill — Gerenciar contas configuradas'

  btn.style.cssText = `
    position: fixed !important; top: 12px !important; right: 12px !important; z-index: 9998 !important;
    padding: 6px 14px !important; border-radius: 20px !important;
    background: rgba(255,255,255,0.95) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    display: flex !important; align-items: center !important; gap: 6px !important;
    cursor: pointer !important; color: #555 !important;
    font-family: 'Open Sans', Arial, sans-serif !important; font-size: 13px !important; font-weight: 600 !important;
    transition: transform 0.15s !important; user-select: none !important;
  `
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)' })
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

  // 2. Reads the CPF/CNPJ from the CREA session (used as the decryption key)
  const cpf = getCPF()

  if (!cpf) {
    hideLoadingScreen()
    showInlineMessage(
      'Não foi possível recuperar os dados da sessão do CREA. ' +
      'Preencha o código manualmente.'
    )
    return
  }

  // 3. Checks if there is a configured endpoint
  let config = await getAccount(emailPattern, cpf)

  // Also tries by domain (for manual domain configurations)
  if (!config) {
    const domain = emailPattern.split('@').at(-1)
    if (domain) config = await getAccount(domain, cpf)
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

  // 4. Fetches the OTP code
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
    // Saves the configuration (encrypted with the CPF)
    const cpf = getCPF()
    if (cpf) {
      await setAccount(emailPattern, result, cpf)
    }

    // Shows feedback and starts fetching
    showInlineMessage('Configuração salva! Buscando código…')
    setLoadingMessage('Buscando código…')
    await pollForCode(result, emailPattern)
  }
}

/**
 * Fetches the OTP code in a loop until found or expired.
 * Handles structured errors from the fetcher:
 *   - unauthorized → deletes account, offers re-setup
 *   - unexpected   → shows error, asks user to fill manually
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern
 */
async function pollForCode (config, emailPattern) {
  const startTime = Date.now()

  while (Date.now() - startTime < MAX_DURATION) {
    const result = await fetchOTP(config, emailPattern)

    // Token rejected — delete the stale account and let the user re-configure
    if (result.error === 'unauthorized') {
      await removeAccount(emailPattern)
      hideLoadingScreen()
      showInlineMessage(
        `O token de autenticação para <strong>${emailPattern}</strong> foi recusado pelo Apps Script. ` +
        'Isso pode acontecer se o token foi alterado.',
        {
          actionLabel: 'Configurar novamente',
          onAction: () => startSetup(emailPattern)
        }
      )
      return
    }

    // Unexpected response (HTML page, malformed JSON, etc.)
    if (result.error === 'unexpected') {
      hideLoadingScreen()
      showInlineMessage(
        'O script no Apps Script retornou uma resposta inesperada. ' +
        'Pode ser um erro temporário no servidor. ' +
        'Preencha o código manualmente.'
      )
      return
    }

    // Code found — fill and submit
    if (result.code) {
      fillAndSubmit(result.code, config, emailPattern)
      return
    }

    // code is null — not arrived yet, wait and retry
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
