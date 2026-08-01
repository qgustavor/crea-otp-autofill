/**
 * Management panel (access via the settings button on the login page):
 * lists configured accounts, lets the user remove them, and export/import
 * the encrypted credential bundle.
 */

import { h, openPanel, escapeAttr, escapeHtml } from './dom.js'

/**
 * Displays a panel to manage configured accounts.
 * @param {{
 *   getAccounts(): Promise<string[]>,
 *   onRemove(emailPattern: string): Promise<void>,
 *   onExport(): Promise<object>,
 *   onInspectImport(data): Promise<{
 *     new: string[],
 *     identical: string[],
 *     conflicts: string[]
 *   }>,
 *   onImport(data: object): Promise<void>
 * }} options
 */
export function showManagePanel ({
  getAccounts,
  onRemove,
  onExport,
  onInspectImport,
  onImport
}) {
  const container = document.createElement('div')
  const ctrl = openPanel(container)

  renderMain()

  /* === Main screen: account list + export/import actions === */

  async function renderMain (note) {
    container.innerHTML = ''

    const accounts = await getAccounts()

    const el = h(`
      <div>
        <h2>Contas configuradas</h2>
        ${note ? renderNoteHTML(note) : ''}
        ${accounts.length === 0
          ? '<p>Nenhuma conta configurada.</p>'
          : '<ul style="list-style: none; padding: 0; margin: 10px 0;"></ul>'
        }
        <div class="coaf-actions">
          <button class="coaf-btn" data-action="export">
            Exportar credenciais
          </button>

          <button class="coaf-btn" data-action="import">
            Importar credenciais
          </button>

          <button class="coaf-btn coaf-btn-secondary" data-action="close">
            Fechar
          </button>
        </div>
      </div>
    `)

    if (accounts.length > 0) {
      const ul = el.querySelector('ul')

      for (const acct of accounts) {
        const li = h(`
          <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="font-size: 14px; font-family: monospace;">${escapeHtml(acct)}</span>
            <button class="coaf-btn coaf-btn-danger" style="padding: 4px 12px; font-size: 12px;">Remover</button>
          </li>
        `)

        li.querySelector('button').addEventListener('click', async () => {
          if (!window.confirm(`Tem certeza que deseja remover a configuração de ${acct}?`)) {
            return
          }

          await onRemove(acct)

          li.remove()

          if (!ul.children.length) {
            ul.replaceWith(h('<p>Nenhuma conta configurada.</p>'))
          }
        })

        ul.appendChild(li)
      }
    }

    el.querySelector('[data-action="export"]').addEventListener('click', async () => {
      const data = await onExport()

      const blob = new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
      )

      const url = URL.createObjectURL(blob)

      try {
        const a = document.createElement('a')
        a.href = url
        a.download = `crea-otp-autofill-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    el.querySelector('[data-action="import"]').addEventListener('click', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'

      input.addEventListener('change', async () => {
        const file = input.files?.[0]
        if (!file) return

        try {
          const data = JSON.parse(await file.text())
          const report = await onInspectImport(data)

          renderImportConfirm(data, report)
        } catch (err) {
          console.error(err)
          renderMain({ type: 'error', text: 'O arquivo selecionado não é um arquivo de exportação válido.' })
        }
      })

      input.click()
    })

    container.appendChild(el)

    el.querySelector('[data-action="close"]').addEventListener('click', () => {
      ctrl.close()
    })
  }

  /* === Import confirmation screen: review new/identical/conflicting accounts === */

  function renderImportConfirm (data, report) {
    container.innerHTML = ''

    const hasSelectable = report.new.length > 0 || report.conflicts.length > 0

    const el = h(`
      <div>
        <h2>Importar credenciais</h2>
        ${report.new.length === 0 && report.conflicts.length === 0 && report.identical.length === 0
          ? '<p>O arquivo selecionado não contém nenhuma conta.</p>'
          : ''
        }
        ${renderGroupHTML({
          items: report.new,
          heading: `${report.new.length} conta(s) nova(s)`,
          hint: 'Serão adicionadas.',
          groupName: 'new',
          checkedByDefault: true
        })}
        ${renderGroupHTML({
          items: report.conflicts,
          heading: `${report.conflicts.length} conta(s) em conflito`,
          hint: 'Já existe uma configuração diferente para essas contas neste dispositivo. Marcar substitui a configuração atual — a antiga não pode ser recuperada depois.',
          groupName: 'conflict',
          checkedByDefault: false,
          warn: true
        })}
        ${report.identical.length > 0
          ? `<p style="font-size: 13px; color: #999; margin-top: 12px;">${report.identical.length} conta(s) já estão idênticas e serão ignoradas.</p>`
          : ''
        }
        <div class="coaf-actions">
          <button class="coaf-btn coaf-btn-secondary" data-action="cancel">Cancelar</button>
          <button class="coaf-btn coaf-btn-primary" data-action="confirm" ${hasSelectable ? '' : 'disabled'}>
            Importar selecionadas
          </button>
        </div>
      </div>
    `)

    for (const toggle of el.querySelectorAll('[data-action="toggle-group"]')) {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('[data-group]').dataset.group
        const boxes = el.querySelectorAll(`input[data-group="${group}"]`)
        const allChecked = [...boxes].every(b => b.checked)
        boxes.forEach(b => { b.checked = !allChecked })
      })
    }

    el.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      renderMain()
    })

    el.querySelector('[data-action="confirm"]').addEventListener('click', async () => {
      const selected = [...el.querySelectorAll('input[type="checkbox"][data-pattern]')]
        .filter(b => b.checked)
        .map(b => b.dataset.pattern)

      if (selected.length === 0) {
        renderMain()
        return
      }

      const filteredAccounts = {}
      for (const pattern of selected) {
        filteredAccounts[pattern] = data.accounts[pattern]
      }

      try {
        await onImport({ ...data, accounts: filteredAccounts })
        renderMain({ type: 'success', text: `${selected.length} conta(s) importada(s) com sucesso.` })
      } catch (err) {
        console.error(err)
        renderMain({ type: 'error', text: 'Falha ao importar credenciais.' })
      }
    })

    container.appendChild(el)
  }

  function renderGroupHTML ({ items, heading, hint, groupName, checkedByDefault, warn }) {
    if (items.length === 0) return ''

    return `
      <div data-group="${groupName}" style="margin-top: 16px; padding: 10px 12px; border-radius: 4px; ${warn ? 'background: #fef8f0; border: 1px solid #f5d9a8;' : 'background: #f7f9fb; border: 1px solid #e9ecef;'}">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <strong style="font-size: 14px;">${heading}</strong>
          <button type="button" class="coaf-btn coaf-btn-secondary" data-action="toggle-group" style="padding: 2px 10px; font-size: 11px;">
            Marcar/desmarcar todas
          </button>
        </div>
        <p style="font-size: 12px; color: ${warn ? '#a15c07' : '#777'}; margin: 4px 0 8px;">${hint}</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${items.map(pattern => `
            <li style="padding: 4px 0;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-family: monospace; cursor: pointer;">
                <input type="checkbox" data-group="${groupName}" data-pattern="${escapeAttr(pattern)}" ${checkedByDefault ? 'checked' : ''} />
                ${escapeHtml(pattern)}
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `
  }

  function renderNoteHTML (note) {
    const isError = note.type === 'error'
    return `
      <p style="padding: 8px 12px; border-radius: 4px; font-size: 13px; margin: 8px 0 12px;
        background: ${isError ? '#fef2f2' : '#eff6ff'};
        border: 1px solid ${isError ? '#fca5a5' : '#93c5fd'};
        color: ${isError ? '#991b1b' : '#1e40af'};">
        ${escapeHtml(note.text)}
      </p>
    `
  }
}
