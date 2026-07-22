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
