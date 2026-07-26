/**
 * Floating inline error/info messages shown on the OTP screen.
 */

import { h } from './dom.js'

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
