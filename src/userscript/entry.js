/**
 * Entry point for the user script (Tampermonkey / Violentmonkey / Greasemonkey).
 *
 * This file is the minimal wrapper that connects the script manager APIs
 * (GM_*) to the shared code in src/core/.
 */

import { init } from '../core/main.js'

init({
  addStyle (css) {
    GM_addStyle(css) // eslint-disable-line no-undef
  }
})
