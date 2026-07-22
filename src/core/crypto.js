/**
 * Secure authentication token generation and credential encryption.
 *
 * - Token: crypto.getRandomValues -> 32 random bytes -> hex.
 * - Encryption: AES-256-GCM with a PBKDF2-derived key from the user's
 *   CPF/CNPJ, so stored credentials are unreadable without it.
 */

const PBKDF2_ITERATIONS = 100_000
const SALT = new TextEncoder().encode('crea-otp-autofill-v1')

/**
 * Generates a random 64-character hexadecimal token (256 bits).
 * @returns {string}
 */
export function generateToken () {
  return crypto.getRandomValues(new Uint8Array(32)).toHex()
}

/**
 * Derives an AES-256-GCM key from a passphrase via PBKDF2.
 * @param {string} passphrase
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey (passphrase) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * @param {string} plaintext
 * @param {string} passphrase — e.g. the user's CPF/CNPJ.
 * @returns {Promise<string>} — Base-64 encoded (IV + ciphertext).
 */
export async function encryptData (plaintext, passphrase) {
  const key = await deriveKey(passphrase)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  let binary = ''
  for (const byte of combined) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/**
 * Decrypts a Base-64 encoded (IV + ciphertext) string.
 * @param {string} ciphertextB64
 * @param {string} passphrase
 * @returns {Promise<string>}
 */
export async function decryptData (ciphertextB64, passphrase) {
  const key = await deriveKey(passphrase)
  const binary = atob(ciphertextB64)
  const combined = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i)

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return new TextDecoder().decode(decrypted)
}
