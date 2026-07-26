/**
 * Main OTP autofill flow, run on the /usuario/valida-login page:
 *   1. Detect the obfuscated email pattern on screen.
 *   2. Look up (or set up) the account configuration.
 *   3. Poll the Apps Script endpoint for the OTP code.
 *   4. Fill and submit, watching for CREA rejecting the code.
 */

import { getAccount, setAccount, removeAccount } from '../storage.js'
import { generateToken } from '../crypto.js'
import { generateAppsScriptCode } from '../apps-script-template.js'
import { fetchOTP } from '../fetcher.js'
import { setLoadingMessage, hideLoadingScreen, showInlineMessage, showSetupWizard } from '../ui/index.js'
import { getCPF, getMinCodeTimestamp } from './session.js'
import { detectEmailPattern } from './email-detection.js'
import { sleep } from './utils.js'

const MAX_DURATION = 40_000 // 40 seconds in total
const RETRY_INTERVAL = 4_000 // Retry every 4 seconds

// Allowed slack between the browser's clock and the Apps Script/Gmail
// server clock when comparing an e-mail's timestamp against the moment
// the user submitted the login form. Only meant to absorb clock drift,
// not to paper over genuinely stale (multi-minute-old) codes.
const CLOCK_SKEW_TOLERANCE = 5_000 // 5 seconds

/**
 * Entry point for the OTP autofill flow.
 */
export async function runOTPFlow () {
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
 * Codes older than the moment the user submitted the login form are
 * ignored (kept polling) instead of being resubmitted — see
 * ./session.js for how that boundary is tracked.
 * @param {{ endpoint: string, token: string }} config
 * @param {string} emailPattern
 */
async function pollForCode (config, emailPattern) {
  const startTime = Date.now()
  const minTimestamp = getMinCodeTimestamp()

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

    // Code found
    if (result.status === 'ok') {
      // codeTimestamp is null when talking to an Apps Script that hasn't
      // been redeployed with the newer protocol yet — nothing to compare
      // against, so trust it like before this check existed.
      const isFreshEnough = result.codeTimestamp === null ||
        result.codeTimestamp >= minTimestamp - CLOCK_SKEW_TOLERANCE

      if (isFreshEnough) {
        fillAndSubmit(result.code, config, emailPattern)
        return
      }
      // Stale code (leftover from an earlier login attempt within the
      // same 10-minute Gmail search window) — keep polling instead of
      // resubmitting a code CREA will only reject.
    }

    // Not arrived yet (or stale) — wait and retry
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
