/**
 * Management panel (access via the settings button on the login page):
 * lists configured accounts and lets the user remove them.
 */

import { h, openPanel } from './dom.js'

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
