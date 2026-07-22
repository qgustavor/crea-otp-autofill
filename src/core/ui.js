/**
 * User interface.
 *
 * Injects panels and messages directly into the CREA page,
 * following the same visual style (border-radius: 4px, bluish shadow).
 */

/* === CSS === */

export const STYLES = /* css */ `
/* Main panel — overlays the CREA content area */
.coaf-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: coaf-fade-in 0.2s ease;
}

@keyframes coaf-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.coaf-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 -25px 37.7px 11.3px rgba(8, 143, 220, 0.07);
  padding: 28px 32px;
  max-width: 480px;
  width: 90vw;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #333;
  line-height: 1.5;
}

.coaf-panel h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.coaf-panel p, .coaf-panel li {
  font-size: 14px;
  color: #555;
  margin: 6px 0;
}

.coaf-panel ol {
  padding-left: 20px;
  margin: 10px 0;
}

.coaf-panel ol li {
  margin: 8px 0;
}

/* Generated code area (Apps Script) */
.coaf-code-area {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  background: #f7f9fb;
  color: #333;
  resize: vertical;
  box-sizing: border-box;
}

.coaf-code-area:focus {
  border-color: #5cb5e3;
  outline: none;
}

/* URL Input */
.coaf-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Open Sans', Arial, sans-serif;
  box-sizing: border-box;
  margin: 4px 0 8px;
}

.coaf-input:focus {
  border-color: #5cb5e3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(92, 181, 227, 0.2);
}

/* Buttons — style similar to the CREA "Entrar" button */
.coaf-btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Open Sans', Arial, sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1;
}

.coaf-btn-primary {
  background: #5cb5e3;
  color: #fff;
}

.coaf-btn-primary:hover {
  background: #4aa3d1;
}

.coaf-btn-secondary {
  background: #e9ecef;
  color: #555;
}

.coaf-btn-secondary:hover {
  background: #dde1e5;
}

.coaf-btn-danger {
  background: #e74c3c;
  color: #fff;
}

.coaf-btn-danger:hover {
  background: #c0392b;
}

.coaf-btn + .coaf-btn {
  margin-left: 8px;
}

.coaf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

/* Inline messages (error / info) — appears on the CREA OTP screen */
.coaf-msg {
  margin: 16px auto;
  max-width: 400px;
  padding: 14px 18px;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 1.5;
  text-align: center;
}

.coaf-msg-error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.coaf-msg-info {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.coaf-msg a, .coaf-panel a {
  color: #5cb5e3;
  text-decoration: underline;
  cursor: pointer;
}

.coaf-msg a:hover, .coaf-panel a:hover {
  color: #4aa3d1;
}

/* Wizard steps */
.coaf-step-indicator {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

/* Separator */
.coaf-sep {
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 16px 0;
}

/* Label */
.coaf-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

/* Inline validation */
.coaf-input-error {
  border-color: #e74c3c !important;
}

.coaf-error-text {
  font-size: 12px;
  color: #e74c3c;
  margin: 2px 0 8px;
}

/* Loading spinner */
.coaf-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-top-color: #5cb5e3;
  border-radius: 50%;
  animation: coaf-spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
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

  // Adjusts the style of the loading-screen to show text below the logo
  screen.style.flexDirection = 'column'

  let msgEl = document.getElementById('coaf-loading-msg')
  if (!msgEl) {
    msgEl = document.createElement('p')
    msgEl.id = 'coaf-loading-msg'
    msgEl.style.cssText = 'color: white; font-family: "Open Sans", Arial, sans-serif; font-size: 16px; margin-top: 18px; text-align: center;'
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
      <p style="margin: 0 0 ${opts.actionLabel ? '10px' : '0'}">${message}</p>
    </div>
  `)

  if (opts.actionLabel && opts.onAction) {
    const btn = h(`<a href="#">${opts.actionLabel}</a>`)
    btn.addEventListener('click', e => { e.preventDefault(); opts.onAction() })
    el.querySelector('p').after(btn)
  }

  // Inserts right after the OTP form, or into the body as fallback
  const otpForm = document.querySelector('[name="validaLoginForm"]') || document.querySelector('.coaf-msg-anchor')
  if (otpForm) {
    otpForm.after(el)
  } else {
    document.body.appendChild(el)
  }
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
    let currentStep = 1
    const totalSteps = 3

    const container = document.createElement('div')
    let panelControl = null

    function render () {
      container.innerHTML = ''

      if (currentStep === 1) container.appendChild(renderStep1())
      else if (currentStep === 2) container.appendChild(renderStep2())
      else if (currentStep === 3) container.appendChild(renderStep3())
    }

    /* === Step 1: Copy the Apps Script code === */

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
            <button class="coaf-btn coaf-btn-secondary" data-action="cancel">Cancelar</button>
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

      el.querySelector('[data-action="next"]').addEventListener('click', () => {
        currentStep = 2
        render()
      })

      el.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        panelControl.close()
        resolve(null)
      })

      return el
    }

    /* === Step 2: Publish as Web App === */

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

    /* === Step 3: Paste the URL === */

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
        resolve({ endpoint: url, token })
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
        if (confirm(`Tem certeza que deseja remover a configuração de ${acct}?`)) {
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
