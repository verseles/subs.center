import test from 'node:test'
import assert from 'node:assert/strict'
import { createKvClient, generateUserKey, validateUserKey } from '../src/services/kvClient.mjs'

test('remote prefix is internal and key validation enforces the 100-character ID limit', () => {
  assert.equal(validateUserKey('my-key_1'), 'my-key_1')
  for (const value of ['', 'a'.repeat(96), 'has space', 'é', 'a/b']) {
    assert.throws(() => validateUserKey(value))
  }
  const generated = generateUserKey({ getRandomValues: (bytes) => bytes.fill(42) })
  assert.match(generated, /^[a-f0-9]{32}$/)
})

test('read 404 is absent, PUT replaces whole document, and errors remain visible', async () => {
  const calls = []
  let missing = true
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    if (!options.method && missing) return { status: 404, ok: false }
    if (options.method) {
      missing = false
      return { status: 200, ok: true, json: async () => ({ version: 1 }) }
    }
    return { status: 200, ok: true, json: async () => ({ version: 1, json: { subscriptions: [] } }) }
  }
  const client = createKvClient(fetchImpl)
  assert.equal(await client.read('user-key'), null)
  await client.write('user-key', { future: true })
  assert.deepEqual(JSON.parse(calls[1].options.body), { future: true })
  assert.equal(calls[1].url, 'https://kv.helio.me/subs-user-key')
  assert.equal(await client.read('user-key').then((result) => result.version), 1)
  assert.equal(calls.length, 3)
  await assert.rejects(createKvClient(async () => ({ status: 429, ok: false })).read('key'), /429/)
  await assert.rejects(client.write('key', { big: 'x'.repeat(1900000) }), /exceeds/)
  assert.equal(calls.length, 3)
})
