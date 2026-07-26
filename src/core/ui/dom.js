/**
 * Low-level DOM helpers shared by every UI module.
 */

/**
 * Creates an HTML element from a string.
 * @param {string} html
 * @returns {HTMLElement}
 */
export function h (html) {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

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
