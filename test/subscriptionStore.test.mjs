import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubscriptionStore } from '../src/services/subscriptionStore.mjs'
import { newDocument } from '../src/services/subscriptionDocument.mjs'

const copy = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value))
const storage = () => {
  const entries = new Map()
  return { getItem: (key) => copy(entries.get(key)), set: (key, value) => entries.set(key, copy(value)) }
}
let nextRandom = 0
const cryptoImpl = {
  getRandomValues(bytes) {
    let value = ++nextRandom
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = value & 255
      value = Math.floor(value / 256)
    }
    return bytes
  }
}
const welcomeItems = [{ title: 'Sample', cost: 5, url: 'sample.com' }]
const makeStore = (options) => createSubscriptionStore({
  storage: storage(), welcomeItems, cryptoImpl, clock: () => 1000, ...options
})

test('existing remote replaces untouched sample rows; missing imported key never writes', async () => {
  let writes = 0
  const remote = newDocument([{ id: 'a', title: 'Remote', cost: 7, url: 'remote.com', updatedAt: 20, changeId: 'r' }])
  const client = { read: async (key) => key === 'missing' ? null : { version: 1, json: remote }, write: async () => { writes++ } }
  const store = makeStore({ client })
  try {
    await assert.rejects(store.connect('missing', { existing: true }), /does not exist/)
    assert.equal(store.snapshot().key, '')
    await store.connect('present', { existing: true })
    assert.deepEqual(store.snapshot().items.map((item) => item.title), ['Remote'])
    assert.equal(writes, 0)
  } finally { store.dispose() }
})

test('two devices share additions, deletions and undo while retaining local state', async () => {
  let remote = null
  let version = 0
  const client = {
    read: async () => remote && { version, json: copy(remote) },
    write: async (_key, doc) => { remote = copy(doc); return { version: ++version } }
  }
  const a = makeStore({ client })
  const b = makeStore({ client })
  try {
    await a.connect('shared')
    await b.connect('shared', { existing: true })
    a.add({ title: 'Service', cost: 9, url: 'service.com' })
    await a.syncNow()
    await b.syncNow()
    assert.equal(b.snapshot().items.length, 2)
    const id = a.snapshot().items.find((item) => item.title === 'Service').id
    a.remove(id)
    await a.syncNow()
    await b.syncNow()
    assert.equal(b.snapshot().items.length, 1)
    a.restore(id)
    await a.syncNow()
    await b.syncNow()
    assert.equal(b.snapshot().items.length, 2)
  } finally { a.dispose(); b.dispose() }
})

test('failed sync keeps local edit and reports error, then retry merges remote sibling', async () => {
  let remote = null
  let fail = false
  const client = {
    read: async () => remote && { version: 1, json: copy(remote) },
    write: async (_key, doc) => {
      if (fail) throw Object.assign(new Error('Sync request failed (429)'), { status: 429 })
      remote = copy(doc)
      return { version: 1 }
    }
  }
  const local = storage()
  const store = makeStore({ storage: local, client })
  try {
    await store.connect('shared')
    remote.futureSettings = { color: 'blue' }
    store.add({ title: 'Offline', cost: 12, url: 'offline.com' })
    fail = true
    await assert.rejects(store.syncNow(), /429/)
    assert.equal(store.snapshot().status, 'error')
    assert.equal(local.getItem('subs.state.v1').document.subscriptions.length, 2)
    fail = false
    await store.syncNow()
    assert.deepEqual(remote.futureSettings, { color: 'blue' })
    assert.equal(remote.subscriptions.length, 2)
  } finally { store.dispose() }
})

test('newer local changes win first import while newer remote records remain', async () => {
  const localStorage = storage()
  localStorage.set('subscriptions', [{ title: 'Local', cost: 1, url: 'local.com' }])
  let remote = newDocument([{ id: 'remote', title: 'Remote', cost: 2, url: 'remote.com', updatedAt: 10, changeId: 'r' }])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { remote = copy(doc); return { version: 2 } }
  }
  const store = makeStore({ storage: localStorage, client })
  try {
    store.add({ title: 'Newer', cost: 3, url: 'newer.com' })
    await store.connect('my-key', { existing: true })
    assert.deepEqual(store.snapshot().items.map((item) => item.title), ['Local', 'Newer', 'Remote'])
    assert.equal(remote.subscriptions.length, 3)
  } finally { store.dispose() }
})

test('a remote 404 after connection does not recreate a deleted document', async () => {
  let writes = 0
  let present = false
  const client = {
    read: async () => present ? { version: 1, json: newDocument([]) } : null,
    write: async () => { writes++; present = true; return { version: 1 } }
  }
  const store = makeStore({ client })
  try {
    await store.connect('my-key')
    present = false
    await assert.rejects(store.syncNow(), /missing/)
    assert.equal(store.snapshot().status, 'missing')
    assert.equal(writes, 1)
  } finally { store.dispose() }
})

test('an older connection response cannot change the active key', async () => {
  let release
  const slow = new Promise((resolve) => { release = resolve })
  let writes = 0
  const client = {
    read: async (key) => key === 'old' ? slow : { version: 1, json: newDocument([]) },
    write: async () => { writes++ }
  }
  const store = makeStore({ client })
  try {
    const pending = store.connect('old', { existing: true })
    await store.connect('new', { existing: true })
    release({ version: 1, json: newDocument([]) })
    await pending
    assert.equal(store.snapshot().key, 'new')
    assert.equal(writes, 0)
  } finally { store.dispose() }
})

test('an addition before importing another key does not upload untouched welcome rows', async () => {
  let remote = newDocument([{ id: 'r', title: 'Remote', cost: 10, url: 'remote.com', updatedAt: 200, changeId: 'r' }])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { remote = copy(doc); return { version: 2 } }
  }
  const store = makeStore({ client })
  try {
    store.add({ title: 'Added', cost: 1, url: 'added.com' })
    await store.connect('other', { existing: true })
    assert.deepEqual(store.snapshot().items.map((item) => item.title), ['Added', 'Remote'])
    assert.equal(remote.subscriptions.length, 2)
  } finally { store.dispose() }
})

test('cross-tab changes keep the active key and propagate added records', async () => {
  const originalWindow = globalThis.window
  const handlers = []
  globalThis.window = {
    addEventListener: (name, handler) => { if (name === 'storage') handlers.push(handler) },
    setInterval: () => 0,
    document: { visibilityState: 'hidden', addEventListener: () => {} }
  }
  const local = storage()
  let remote = newDocument([{ id: 'r', title: 'Remote', cost: 3, url: 'remote.com', updatedAt: 5, changeId: 'r' }])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { remote = copy(doc); return { version: 2 } }
  }
  const a = makeStore({ storage: local, client })
  const b = makeStore({ storage: local, client })
  try {
    a.start()
    b.start()
    a.add({ title: 'Added', cost: 6, url: 'added.com' })
    handlers[1]({ key: 'subs.state.v1' })
    await b.connect('shared', { existing: true })
    assert.deepEqual(b.snapshot().items.map((item) => item.title), ['Added', 'Remote'])
    handlers[0]({ key: 'subs.state.v1' })
    assert.equal(a.snapshot().key, 'shared')
    assert.deepEqual(a.snapshot().items.map((item) => item.title), ['Added', 'Remote'])
    await a.syncNow()
    assert.equal(remote.subscriptions.some((item) => item.title === 'Sample'), false)
    b.disconnect()
    handlers[0]({ key: 'subs.state.v1' })
    assert.equal(a.snapshot().key, '')
    a.add({ title: 'Later', cost: 8, url: 'later.com' })
    assert.equal(local.getItem('subs.state.v1').key, '')
  } finally {
    a.dispose()
    b.dispose()
    globalThis.window = originalWindow
  }
})

test('a local addition made during the first upload survives connection', async () => {
  let release
  const deferred = new Promise((resolve) => { release = resolve })
  let remote = newDocument([{ id: 'remote', title: 'Remote', cost: 3, url: 'r.com', updatedAt: 4, changeId: 'r' }])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { await deferred; remote = copy(doc); return { version: 2 } }
  }
  const store = makeStore({ client })
  try {
    store.add({ title: 'Before', cost: 2, url: 'before.com' })
    const connecting = store.connect('shared', { existing: true })
    await Promise.resolve()
    store.add({ title: 'During', cost: 7, url: 'during.com' })
    release()
    await connecting
    assert.deepEqual(store.snapshot().items.map((item) => item.title), ['Before', 'During', 'Remote'])
    assert.equal(store.snapshot().status, 'pending')
    await store.syncNow()
    assert.equal(remote.subscriptions.some((item) => item.title === 'During'), true)
  } finally { store.dispose() }
})

test('deleting a seeded row preserves its tombstone when importing remote', async () => {
  const id = createSubscriptionStore({ storage: storage(), welcomeItems, cryptoImpl, clock: () => 1000 }).snapshot().items[0].id
  let remote = newDocument([{ id, title: 'Sample', cost: 5, url: 'sample.com', updatedAt: 0, changeId: 'legacy' }])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { remote = copy(doc); return { version: 2 } }
  }
  const store = makeStore({ client })
  try {
    store.remove(id)
    await store.connect('shared', { existing: true })
    assert.equal(store.snapshot().items.length, 0)
    assert.equal(remote.subscriptions[0].deletedAt > 0, true)
  } finally { store.dispose() }
})

test('a cross-tab key change releases an older pending connection', async () => {
  const previousWindow = globalThis.window
  const handlers = []
  globalThis.window = {
    addEventListener: (name, callback) => { if (name === 'storage') handlers.push(callback) },
    setInterval: () => 0,
    document: { visibilityState: 'hidden', addEventListener: () => {} }
  }
  const local = storage()
  let release
  const deferred = new Promise((resolve) => { release = resolve })
  const client = {
    read: async (key) => key === 'slow' ? deferred : { version: 1, json: newDocument([]) },
    write: async () => ({ version: 2 })
  }
  const a = makeStore({ storage: local, client })
  const b = makeStore({ storage: local, client })
  try {
    a.start()
    b.start()
    const stale = a.connect('slow', { existing: true })
    await b.connect('active', { existing: true })
    handlers[0]({ key: 'subs.state.v1' })
    release({ version: 1, json: newDocument([]) })
    await stale
    assert.equal(a.snapshot().key, 'active')
    await a.syncNow()
    assert.equal(a.snapshot().status, 'synced')
  } finally {
    a.dispose()
    b.dispose()
    globalThis.window = previousWindow
  }
})

test('a deletion received from another tab is not marked as pristine on import', async () => {
  const previousWindow = globalThis.window
  const handlers = []
  globalThis.window = {
    addEventListener: (name, callback) => { if (name === 'storage') handlers.push(callback) },
    setInterval: () => 0,
    document: { visibilityState: 'hidden', addEventListener: () => {} }
  }
  const local = storage()
  let remote = newDocument([])
  const client = {
    read: async () => ({ version: 1, json: copy(remote) }),
    write: async (_key, doc) => { remote = copy(doc); return { version: 2 } }
  }
  const a = makeStore({ storage: local, client })
  const b = makeStore({ storage: local, client })
  try {
    a.start()
    b.start()
    const id = a.snapshot().items[0].id
    remote = newDocument([{ id, title: 'Sample', cost: 5, url: 'sample.com', updatedAt: 0, changeId: 'legacy' }])
    a.remove(id)
    handlers[1]({ key: 'subs.state.v1' })
    await b.connect('shared', { existing: true })
    assert.equal(b.snapshot().items.length, 0)
    assert.equal(remote.subscriptions[0].deletedAt > 0, true)
  } finally {
    a.dispose()
    b.dispose()
    globalThis.window = previousWindow
  }
})
