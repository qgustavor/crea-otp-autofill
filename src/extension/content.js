/**
 * Entry point for the Firefox extension.
 *
 * Uses the standard WebExtension APIs instead of the GM_* APIs.
 */

import { init } from '../core/main.js'

init({
  addStyle (css) {
    const el = document.createElement('style')
    el.textContent = css
    ;(document.head || document.documentElement).appendChild(el)
  }
})
