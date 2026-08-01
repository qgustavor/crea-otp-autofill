/**
 * Storage abstraction.
 *
 * Each "account" is indexed by the obfuscated email pattern displayed by CREA
 * (e.g., "ex***le@g***.com"). The value ({ endpoint, token }) is encrypted
 * with AES-256-GCM, keyed by the user's CPF/CNPJ, so inspecting storage
 * reveals which accounts exist but not their credentials.
 *
 * In the user script we use GM_getValue / GM_setValue.
 * In the extension we use browser.storage.local.
 */
/* global GM_getValue, GM_setValue, GM_deleteValue, GM_listValues, __BUILD_TARGET__ */

import { encryptData, decryptData } from './crypto.js'

// User-script helpers
const gmStorage = {
  async get (key) {
    return GM_getValue(key, null)
  },

  async set (key, value) {
    GM_setValue(key, value)
  },

  async remove (key) {
    GM_deleteValue(key)
  },

  async listKeys () {
    return GM_listValues()
  }
}

// Extension helpers
const extStorage = {
  async get (key) {
    const result = await browser.storage.local.get(key)
    return result[key] ?? null
  },

  async set (key, value) {
    await browser.storage.local.set({ [key]: value })
  },

  async remove (key) {
    await browser.storage.local.remove(key)
  },

  async listKeys () {
    const all = await browser.storage.local.get(null)
    return Object.keys(all)
  }
}

// Public API
const ACCOUNT_PREFIX = 'account:'
const backend = __BUILD_TARGET__ === 'extension' ? extStorage : gmStorage

/**
 * Returns the saved configuration for an email pattern, decrypting it with the
 * user's CPF/CNPJ.
 * @param {string} emailPattern — e.g., "ex***lo@g***.com"
 * @param {string} passphrase  — the CPF/CNPJ used as the encryption key.
 * @returns {Promise<{ endpoint: string, token: string } | null>}
 */
export async function getAccount (emailPattern, passphrase) {
  const raw = await backend.get(ACCOUNT_PREFIX + emailPattern)
  if (!raw || !passphrase) return null
  try {
    const decrypted = await decryptData(raw, passphrase)
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

/**
 * Saves the configuration for an email pattern, encrypting it with the user's
 * CPF/CNPJ.
 * @param {string} emailPattern
 * @param {{ endpoint: string, token: string }} config
 * @param {string} passphrase
 */
export async function setAccount (emailPattern, config, passphrase) {
  const encrypted = await encryptData(JSON.stringify(config), passphrase)
  return backend.set(ACCOUNT_PREFIX + emailPattern, encrypted)
}

/**
 * Removes the configuration for an email pattern.
 * @param {string} emailPattern
 */
export async function removeAccount (emailPattern) {
  return backend.remove(ACCOUNT_PREFIX + emailPattern)
}

/**
 * Lists all configured email patterns.
 * @returns {Promise<string[]>}
 */
export async function listAccounts () {
  const keys = await backend.listKeys()
  return keys
    .filter(k => k.startsWith(ACCOUNT_PREFIX))
    .map(k => k.slice(ACCOUNT_PREFIX.length))
}

/**
 * Exports all configured accounts exactly as stored.
 * @returns {Promise<{
 *   format: 'crea-otp-autofill',
 *   version: 1,
 *   exportedAt: string,
 *   accounts: Record<string, string>
 * }>}
 */
export async function exportAccounts () {
  const accounts = {}

  for (const key of await backend.listKeys()) {
    if (!key.startsWith(ACCOUNT_PREFIX)) continue

    accounts[key.slice(ACCOUNT_PREFIX.length)] = await backend.get(key)
  }

  return {
    format: 'crea-otp-autofill',
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts
  }
}

/**
 * Imports an account export created by exportAccounts().
 * Existing accounts are overwritten.
 * @param {unknown} data
 */
export async function importAccounts (data) {
  const accounts = validateImportData(data)

  for (const [emailPattern, encrypted] of Object.entries(accounts)) {
    if (typeof encrypted !== 'string') {
      throw new Error(`Invalid account entry: ${emailPattern}`)
    }

    await backend.set(ACCOUNT_PREFIX + emailPattern, encrypted)
  }
}

/**
 * Validates an exported account bundle.
 * @param {unknown} data
 * @returns {Record<string, string>}
 * @throws {Error} If the bundle is invalid.
 */
function validateImportData (data) {
  if (
    !data ||
    typeof data !== 'object' ||
    data.format !== 'crea-otp-autofill' ||
    data.version !== 1 ||
    typeof data.accounts !== 'object' ||
    data.accounts === null ||
    Array.isArray(data.accounts)
  ) {
    throw new Error('Invalid export file.')
  }

  return data.accounts
}

/**
 * Inspects an exported account bundle without importing it.
 * @param {unknown} data
 * @returns {Promise<{
 *   new: string[],
 *   identical: string[],
 *   conflicts: string[]
 * }>}
 */
export async function inspectImport (data) {
  const accounts = validateImportData(data)

  const report = {
    new: [],
    identical: [],
    conflicts: []
  }

  for (const [emailPattern, imported] of Object.entries(accounts)) {
    if (typeof imported !== 'string') {
      throw new Error(`Invalid account entry: ${emailPattern}`)
    }

    const current = await backend.get(ACCOUNT_PREFIX + emailPattern)

    if (current == null) {
      report.new.push(emailPattern)
    } else if (current === imported) {
      report.identical.push(emailPattern)
    } else {
      report.conflicts.push(emailPattern)
    }
  }

  return report
}
