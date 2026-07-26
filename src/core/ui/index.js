/**
 * User interface — barrel module.
 *
 * Re-exports everything main.js needs, so callers don't need to know
 * how the UI is split internally (styles.css / dom.js / loading.js /
 * messages.js / setup-wizard.js / manage-panel.js).
 */

import STYLES from './styles.css' with { type: 'text' }

export { STYLES }
export { setLoadingMessage, hideLoadingScreen } from './loading.js'
export { showInlineMessage } from './messages.js'
export { showSetupWizard } from './setup-wizard.js'
export { showManagePanel } from './manage-panel.js'
