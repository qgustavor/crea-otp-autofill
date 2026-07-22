/**
 * Secure authentication token generation.
 *
 * Uses crypto.getRandomValues to generate 32 random bytes (256 bits) and convert them to hexadecimal.
 */

/**
 * Generates a random 64-character hexadecimal token (256 bits).
 * @returns {string}
 */
export function generateToken () {
  return crypto.getRandomValues(new Uint8Array(32)).toHex()
}
