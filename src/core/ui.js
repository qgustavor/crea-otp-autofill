/**
 * User interface.
 *
 * Injects panels and messages directly into the CREA page,
 * following the same visual style (border-radius: 4px, bluish shadow).
 */

/* === CSS === */

export const STYLES = /* css */ `
/* Force loading screen to stay visible and flow vertically while we process */
#loading-screen.coaf-force-loading {
  display: flex !important;
  flex-direction: column !important;
}

/* Main panel — overlays the CREA content area */
.coaf-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 10000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(0, 0, 0, 0.4) !important;
  animation: coaf-fade-in 0.2s ease !important;
}

@keyframes coaf-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.coaf-panel {
  background: #fff !important;
  border-radius: 4px !important;
  box-shadow: 0 -25px 37.7px 11.3px rgba(8, 143, 220, 0.07) !important;
  padding: 28px 32px !important;
  max-width: 600px !important;
  width: 90vw !important;
  font-family: 'Open Sans', Arial, sans-serif !important;
  color: #333 !important;
  line-height: 1.5 !important;
  text-align: left !important;
}

/* Force alignment and fonts to prevent CREA's global CSS overrides */
.coaf-panel h2, .coaf-panel p, .coaf-panel li, .coaf-panel div, .coaf-panel span, .coaf-panel label, .coaf-panel strong,
.coaf-msg, .coaf-msg p, .coaf-msg strong {
  font-family: 'Open Sans', Arial, sans-serif !important;
  line-height: 1.5 !important;
  text-align: left !important;
}

.coaf-panel h2 {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #1a1a1a !important;
  margin: 0 0 6px !important;
}

.coaf-panel p, .coaf-panel li {
  font-size: 14px !important;
  color: #555 !important;
  margin: 6px 0 !important;
}

.coaf-panel ol {
  padding-left: 20px !important;
  margin: 10px 0 !important;
}

.coaf-panel ol li {
  margin: 8px 0 !important;
}

/* Generated code area (Apps Script) */
.coaf-code-area {
  width: 100% !important;
  min-height: 80px !important;
  padding: 10px !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 12px !important;
  background: #f7f9fb !important;
  color: #333 !important;
  resize: vertical !important;
  box-sizing: border-box !important;
}

.coaf-code-area:focus {
  border-color: #337ab7 !important;
  outline: none !important;
}

/* URL Input */
.coaf-input {
  width: 100% !important;
  padding: 10px 12px !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-family: 'Open Sans', Arial, sans-serif !important;
  box-sizing: border-box !important;
  margin: 4px 0 8px !important;
}

.coaf-input:focus {
  border-color: #337ab7 !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(51, 122, 183, 0.2) !important;
}

/* Buttons */
.coaf-btn {
  display: inline-block !important;
  padding: 10px 20px !important;
  border: none !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  font-family: 'Open Sans', Arial, sans-serif !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: background 0.15s !important;
  line-height: 1 !important;
}

.coaf-btn-primary {
  background: #337ab7 !important;
  color: #fff !important;
}

.coaf-btn-primary:hover {
  background: #286090 !important;
}

.coaf-btn-secondary {
  background: #e9ecef !important;
  color: #555 !important;
}

.coaf-btn-secondary:hover {
  background: #dde1e5 !important;
}

.coaf-btn-danger {
  background: #e74c3c !important;
  color: #fff !important;
}

.coaf-btn-danger:hover {
  background: #c0392b !important;
}

.coaf-btn + .coaf-btn {
  margin-left: 8px !important;
}

.coaf-actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  margin-top: 18px !important;
}

/* Inline messages (error / info) — Floats top-right */
.coaf-msg {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  z-index: 10001 !important;
  margin: 0 !important;
  max-width: 400px !important;
  padding: 14px 18px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

.coaf-msg p {
  margin: 0 !important;
}

.coaf-msg-error {
  background: #fef2f2 !important;
  border: 1px solid #fca5a5 !important;
  color: #991b1b !important;
}

.coaf-msg-info {
  background: #eff6ff !important;
  border: 1px solid #93c5fd !important;
  color: #1e40af !important;
}

.coaf-msg a, .coaf-panel a {
  color: #337ab7 !important;
  text-decoration: underline !important;
  cursor: pointer !important;
}

.coaf-msg a {
  display: inline-block !important;
  margin-top: 8px !important;
}

.coaf-msg a:hover, .coaf-panel a:hover {
  color: #286090 !important;
}

/* Wizard steps */
.coaf-step-indicator {
  font-size: 12px !important;
  color: #999 !important;
  margin-bottom: 12px !important;
}

/* Separator */
.coaf-sep {
  border: none !important;
  border-top: 1px solid #e9ecef !important;
  margin: 16px 0 !important;
}

/* Label */
.coaf-label {
  display: block !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #555 !important;
  margin-bottom: 4px !important;
}

/* Inline validation */
.coaf-input-error {
  border-color: #e74c3c !important;
}

.coaf-error-text {
  font-size: 12px !important;
  color: #e74c3c !important;
  margin: 2px 0 8px !important;
  text-align: left !important;
  font-family: 'Open Sans', Arial, sans-serif !important;
}

/* Loading spinner */
.coaf-spinner {
  display: inline-block !important;
  width: 16px !important;
  height: 16px !important;
  border: 2px solid #ccc !important;
  border-top-color: #337ab7 !important;
  border-radius: 50% !important;
  animation: coaf-spin 0.6s linear infinite !important;
  vertical-align: middle !important;
  margin-right: 6px !important;
}

@keyframes coaf-spin {
  to { transform: rotate(360deg); }
}
`

/* === Helpers === */

/**
 * Creates an HTML element from a string.
 * @param {string} html
 * @returns {HTMLElement}
 */
function h (html) {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

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

/* === Error/info messages on the OTP screen === */

/**
 * Shows an error message on the page.
 * @param {string} message — Main text.
 * @param {{ actionLabel?: string, onAction?: () => void }} [opts]
 */
export function showInlineMessage (message, opts = {}) {
  // Remove previous message
  document.querySelector('.coaf-msg')?.remove()

  const isError = !opts.actionLabel
  const typeClass = isError ? 'coaf-msg-error' : 'coaf-msg-info'

  const el = h(`
    <div class="coaf-msg ${typeClass}">
      <p>${message}</p>
    </div>
  `)

  if (opts.actionLabel && opts.onAction) {
    const btn = h(`<button>${opts.actionLabel}</button>`)
    btn.className = 'coaf-btn coaf-btn-primary'
    btn.addEventListener('click', e => { e.preventDefault(); opts.onAction() })
    el.appendChild(btn)
  }

  // Floating at top right, so just append it to body safely
  document.body.appendChild(el)
}

/* === Overlay / Panel === */

/**
 * Opens a panel (modal) over the page.
 * @param {HTMLElement} contentEl — The panel content.
 * @returns {{ close: () => void }} — Control to close the panel.
 */
export function openPanel (contentEl) {
  const overlay = h('<div class="coaf-overlay"></div>')
  const panel = h('<div class="coaf-panel"></div>')
  panel.appendChild(contentEl)
  overlay.appendChild(panel)
  document.body.appendChild(overlay)

  // Close when clicking outside
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close()
  })

  function close () {
    overlay.remove()
  }

  return { close }
}

/* === Setup Wizard === */

/**
 * Displays the setup wizard for an email pattern.
 * Returns a Promise that resolves when the user completes or cancels.
 *
 * @param {string} emailPattern — E.g.: "ex***le@g***.com"
 * @param {string} appsScriptCode — Ready-to-use Apps Script code.
 * @param {string} token — Automatically generated token.
 * @returns {Promise<{ endpoint: string, token: string } | null>}
 */
export function showSetupWizard (emailPattern, appsScriptCode, token) {
  return new Promise(resolve => {
    let currentStep = 0
    let flow = null // 'new' | 'existing'
    const totalSteps = 3

    const container = document.createElement('div')
    let panelControl = null

    function render () {
      container.innerHTML = ''

      if (currentStep === 0) {
        container.appendChild(renderStep0())
      } else if (flow === 'new') {
        if (currentStep === 1) container.appendChild(renderStep1())
        else if (currentStep === 2) container.appendChild(renderStep2())
        else if (currentStep === 3) container.appendChild(renderStep3())
      } else if (flow === 'existing') {
        if (currentStep === 1) container.appendChild(renderAltStep1())
      }
    }

    /* === Step 0: Choice (New vs Existing) === */

    function renderStep0 () {
      const el = h(`
        <div>
          <h2>Configuração do Preenchimento Automático</h2>
          <p>O preenchimento automático precisa de um script na sua conta Google para ler os códigos do CREA.</p>
          <p>Você já configurou esse script antes em outro computador ou navegador para <strong>${emailPattern}</strong>?</p>
          <div class="coaf-actions" style="justify-content: flex-start !important; flex-direction: column !important; gap: 8px !important; margin-top: 24px !important;">
            <button class="coaf-btn coaf-btn-primary" style="width: 100% !important; margin-left: 0 !important;" data-action="new">Não, é a primeira vez (Criar novo script)</button>
            <button class="coaf-btn coaf-btn-secondary" style="width: 100% !important; margin-left: 0 !important;" data-action="existing">Sim, já configurei antes (Vincular script existente)</button>
            <button class="coaf-btn coaf-btn-secondary" style="width: 100% !important; margin-left: 0 !important; background: transparent !important; border: 1px solid #ccc !important;" data-action="cancel">Cancelar</button>
          </div>
        </div>
      `)

      el.querySelector('[data-action="new"]').addEventListener('click', () => {
        flow = 'new'
        currentStep = 1
        render()
      })

      el.querySelector('[data-action="existing"]').addEventListener('click', () => {
        flow = 'existing'
        currentStep = 1
        render()
      })

      el.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        panelControl.close()
        resolve(null)
      })

      return el
    }

    /* === Step 1 (New): Copy the Apps Script code === */

    function renderStep1 () {
      const el = h(`
        <div>
          <div class="coaf-step-indicator">Passo ${currentStep} de ${totalSteps}</div>
          <h2>Criar o script no Google</h2>
          <p>
            Para que o preenchimento automático funcione, é preciso criar um pequeno
            script na conta Google que recebe os e-mails do CREA.
          </p>
          <ol>
            <li>
              Acesse o
              <a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener">Google Apps Script</a>
              (logado na conta que recebe os e-mails do CREA).
            </li>
            <li>Apague todo o conteúdo que aparecer no editor.</li>
            <li>Copie o código abaixo e cole no editor.</li>
            <li>Clique em <strong>Salvar</strong> (Ctrl+S).</li>
          </ol>
          <textarea class="coaf-code-area" rows="6" readonly></textarea>
          <div class="coaf-actions">
            <button class="coaf-btn coaf-btn-secondary" data-action="back">← Voltar</button>
            <button class="coaf-btn coaf-btn-primary" data-action="copy">Copiar código</button>
            <button class="coaf-btn coaf-btn-primary" data-action="next">Próximo →</button>
          </div>
        </div>
      `)

      el.querySelector('.coaf-code-area').value = appsScriptCode

      el.querySelector('[data-action="copy"]').addEventListener('click', () => {
        const copyBtn = el.querySelector('[data-action="copy"]')
        navigator.clipboard.writeText(appsScriptCode).then(() => {
          copyBtn.textContent = 'Copiado!'
          setTimeout(() => { copyBtn.textContent = 'Copiar código' }, 2000)
        })
      })

      el.querySelector('[data-action="back"]').addEventListener('click', () => {
        currentStep = 0
        render()
      })

      el.querySelector('[data-action="next"]').addEventListener('click', () => {
        currentStep = 2
        render()
      })

      return el
    }

    /* === Step 2 (New): Publish as Web App === */

    function renderStep2 () {
      const el = h(`
        <div>
          <div class="coaf-step-indicator">Passo ${currentStep} de ${totalSteps}</div>
          <h2>Publicar o script</h2>
          <p>Ainda no Google Apps Script:</p>
          <ol>
            <li>Clique em <strong>Implantar</strong> → <strong>Nova implantação</strong>.</li>
            <li>Em "Tipo", clique na engrenagem e selecione <strong>App da Web</strong>.</li>
            <li>Em "Executar como", selecione <strong>Eu</strong>.</li>
            <li>Em "Quem pode acessar", selecione <strong>Qualquer pessoa</strong>.</li>
            <li>Clique em <strong>Implantar</strong>.</li>
            <li>
              Autorize as permissões quando solicitado
              (o script precisa ler seus e-mails para encontrar o código).
            </li>
            <li>Copie a <strong>URL</strong> que aparecerá na tela.</li>
          </ol>
          <div class="coaf-actions">
            <button class="coaf-btn coaf-btn-secondary" data-action="back">← Voltar</button>
            <button class="coaf-btn coaf-btn-primary" data-action="next">Próximo →</button>
          </div>
        </div>
      `)

      el.querySelector('[data-action="back"]').addEventListener('click', () => {
        currentStep = 1
        render()
      })

      el.querySelector('[data-action="next"]').addEventListener('click', () => {
        currentStep = 3
        render()
      })

      return el
    }

    /* === Step 3 (New): Paste the URL === */

    function renderStep3 () {
      const el = h(`
        <div>
          <div class="coaf-step-indicator">Passo ${currentStep} de ${totalSteps}</div>
          <h2>Colar a URL</h2>
          <p>Cole abaixo a URL do Web App que você copiou no passo anterior:</p>
          <label class="coaf-label">URL do Web App</label>
          <input
            class="coaf-input"
            type="url"
            placeholder="https://script.google.com/macros/s/…/exec"
            spellcheck="false"
          />
          <div class="coaf-error-text" style="display:none"></div>
          <div class="coaf-actions">
            <button class="coaf-btn coaf-btn-secondary" data-action="back">← Voltar</button>
            <button class="coaf-btn coaf-btn-primary" data-action="save">Salvar</button>
          </div>
        </div>
      `)

      const input = el.querySelector('input')
      const errorText = el.querySelector('.coaf-error-text')

      el.querySelector('[data-action="back"]').addEventListener('click', () => {
        currentStep = 2
        render()
      })

      el.querySelector('[data-action="save"]').addEventListener('click', () => {
        const url = input.value.trim()
        const match = url.match(
          /^https?:\/\/script\.google\.com\/macros\/s\/([^/]+)\/exec$/i
        )

        if (!match) {
          input.classList.add('coaf-input-error')
          errorText.textContent = 'URL inválida. O formato correto é: https://script.google.com/macros/s/…/exec'
          errorText.style.display = 'block'
          return
        }

        panelControl.close()
        resolve({ endpoint: url, token }) // Uses auto-generated token
      })

      return el
    }

    /* === Alternative Step 1 (Existing): Fetch Script Data === */

    function renderAltStep1 () {
      const el = h(`
        <div>
          <div class="coaf-step-indicator">Passo único</div>
          <h2>Vincular script existente</h2>
          <p>Acesse o <a href="https://script.google.com/home" target="_blank" rel="noopener">Google Apps Script</a> e abra o projeto que você já havia criado para este e-mail.</p>
          
          <label class="coaf-label">URL de Implantação (Web App)</label>
          <input
            class="coaf-input"
            type="url"
            placeholder="https://script.google.com/macros/s/…/exec"
            spellcheck="false"
            id="coaf-alt-url"
          />

          <label class="coaf-label" style="margin-top: 12px !important;">Código do script (para recuperarmos o token)</label>
          <textarea 
            class="coaf-code-area" 
            rows="4" 
            placeholder="Cole todo o código do script aqui..." 
            id="coaf-alt-code"
          ></textarea>

          <div class="coaf-error-text" style="display:none"></div>

          <div class="coaf-actions">
            <button class="coaf-btn coaf-btn-secondary" data-action="back">← Voltar</button>
            <button class="coaf-btn coaf-btn-primary" data-action="save">Salvar configuração</button>
          </div>
        </div>
      `)

      const inputUrl = el.querySelector('#coaf-alt-url')
      const inputCode = el.querySelector('#coaf-alt-code')
      const errorText = el.querySelector('.coaf-error-text')

      el.querySelector('[data-action="back"]').addEventListener('click', () => {
        currentStep = 0
        render()
      })

      el.querySelector('[data-action="save"]').addEventListener('click', () => {
        errorText.style.display = 'none'
        inputUrl.classList.remove('coaf-input-error')
        inputCode.classList.remove('coaf-input-error')

        const url = inputUrl.value.trim()
        const code = inputCode.value.trim()

        // Validates Web App URL
        const urlMatch = url.match(/^https?:\/\/script\.google\.com\/macros\/s\/([^/]+)\/exec$/i)
        if (!urlMatch) {
          inputUrl.classList.add('coaf-input-error')
          errorText.textContent = 'URL inválida. O formato correto é: https://script.google.com/macros/s/…/exec'
          errorText.style.display = 'block'
          return
        }

        // Extracts Token using Regex
        const tokenMatch = code.match(/const\s+TOKEN\s*=\s*['"]([^'"]+)['"]/i)
        if (!tokenMatch) {
          inputCode.classList.add('coaf-input-error')
          errorText.textContent = 'Não foi possível encontrar o TOKEN no código colado. Certifique-se de copiar o script inteiro.'
          errorText.style.display = 'block'
          return
        }

        panelControl.close()
        // Resolves with the endpoint they provided and the extracted token
        resolve({ endpoint: url, token: tokenMatch[1] })
      })

      return el
    }

    /* === Open the panel === */

    render()
    panelControl = openPanel(container)
  })
}

/* === Management panel (access via settings button) === */

/**
 * Displays a panel to manage configured accounts.
 * @param {string[]} accounts — List of configured emails.
 * @param {(emailPattern: string) => Promise<void>} onRemove — Callback to remove.
 */
export function showManagePanel (accounts, onRemove) {
  const container = document.createElement('div')

  const el = h(`
    <div>
      <h2>Contas configuradas</h2>
      ${accounts.length === 0
        ? '<p>Nenhuma conta configurada.</p>'
        : '<ul style="list-style: none; padding: 0; margin: 10px 0;"></ul>'
      }
      <div class="coaf-actions">
        <button class="coaf-btn coaf-btn-secondary" data-action="close">Fechar</button>
      </div>
    </div>
  `)

  if (accounts.length > 0) {
    const ul = el.querySelector('ul')
    for (const acct of accounts) {
      const li = h(`
        <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
          <span style="font-size: 14px; font-family: monospace;">${acct}</span>
          <button class="coaf-btn coaf-btn-danger" style="padding: 4px 12px; font-size: 12px;">Remover</button>
        </li>
      `)
      li.querySelector('button').addEventListener('click', async () => {
        if (window.confirm(`Tem certeza que deseja remover a configuração de ${acct}?`)) {
          await onRemove(acct)
          li.remove()
          if (!ul.children.length) {
            ul.replaceWith(h('<p>Nenhuma conta configurada.</p>'))
          }
        }
      })
      ul.appendChild(li)
    }
  }

  container.appendChild(el)
  const ctrl = openPanel(container)
  el.querySelector('[data-action="close"]').addEventListener('click', () => ctrl.close())
}
