/**
 * The "CREA OTP Auto-Fill" pill button shown on the login page (top-right),
 * and the account-management panel it opens.
 */

import { listAccounts, removeAccount } from '../storage.js'
import { showManagePanel } from '../ui/index.js'

/**
 * Injects the "CREA OTP Auto-Fill" button on the login page (top-right).
 */
export function injectSettingsButton () {
  if (!document.body) return

  const btn = document.createElement('div')

  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    <span>CREA OTP Auto-Fill</span>
  `
  btn.title = 'CREA OTP Auto-Fill — Gerenciar contas configuradas'

  btn.style.cssText = `
    position: fixed !important; top: 12px !important; right: 12px !important; z-index: 9998 !important;
    padding: 6px 14px !important; border-radius: 20px !important;
    background: rgba(255,255,255,0.95) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    display: flex !important; align-items: center !important; gap: 6px !important;
    cursor: pointer !important; color: #555 !important;
    font-family: 'Open Sans', Arial, sans-serif !important; font-size: 13px !important; font-weight: 600 !important;
    transition: transform 0.15s !important; user-select: none !important;
  `
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)' })
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)' })
  btn.addEventListener('click', openSettings)
  document.body.appendChild(btn)
}

/**
 * Opens the account management panel.
 */
async function openSettings () {
  const accounts = await listAccounts()
  showManagePanel(accounts, async emailPattern => {
    await removeAccount(emailPattern)
  })
}
