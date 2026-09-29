const BASE_URL = 'https://kv.helio.me'
const MAX_BYTES = 1900000
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,95}$/

export function validateUserKey(key) {
  if (typeof key !== 'string' || !KEY_PATTERN.test(key)) {
    throw new Error('Key must be 1–95 letters, numbers, hyphens or underscores')
  }
  return key
}

export function generateUserKey(cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure key generation is unavailable')
  const bytes = cryptoImpl.getRandomValues(new Uint8Array(16))
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function urlFor(key) {
  return `${BASE_URL}/subs-${validateUserKey(key)}`
}

async function request(fetchImpl, url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal, cache: 'no-store' })
    if (response.status === 404 && !options.method) return null
    if (!response.ok) {
      const error = new Error(`Sync request failed (${response.status})`)
      error.status = response.status
      throw error
    }
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

export function createKvClient(fetchImpl = fetch) {
  return {
    async read(key) {
      const result = await request(fetchImpl, urlFor(key))
      if (result !== null && (!Number.isSafeInteger(result.version) || !Object.prototype.hasOwnProperty.call(result, 'json'))) {
        throw new Error('Invalid sync response')
      }
      return result
    },
    async write(key, document) {
      const url = urlFor(key)
      const body = JSON.stringify(document)
      if (new TextEncoder().encode(body).length > MAX_BYTES) throw new Error('Sync document exceeds 1,900,000 bytes')
      const result = await request(fetchImpl, url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      })
      if (!Number.isSafeInteger(result.version)) throw new Error('Invalid sync response')
      return result
    }
  }
}
