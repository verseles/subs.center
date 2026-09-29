import {
  documentsEqual, mergeDocuments, migrateLegacy, newDocument, nextTimestamp,
  validateDocument, visibleSubscriptions
} from './subscriptionDocument.mjs'
import { createKvClient, generateUserKey, validateUserKey } from './kvClient.mjs'

const STORAGE_KEY = 'subs.state.v1'

export function createSubscriptionStore({ storage, welcomeItems, client = createKvClient(), clock = Date.now, cryptoImpl = globalThis.crypto, onChange = () => {} }) {
  const saved = storage.getItem(STORAGE_KEY)
  const legacy = storage.getItem('subscriptions')
  let document
  let seed = false
  let key = ''
  let welcomeIds = []

  if (saved) {
    document = validateDocument(saved.document)
    seed = saved.seed === true
    key = saved.key ? validateUserKey(saved.key) : ''
    welcomeIds = Array.isArray(saved.welcomeIds) ? saved.welcomeIds : []
  } else {
    document = newDocument(migrateLegacy(legacy || welcomeItems))
    seed = !legacy || documentsEqual(document, newDocument(migrateLegacy(welcomeItems)))
    if (seed) welcomeIds = document.subscriptions.map((item) => item.id)
  }

  let status = key ? 'pending' : 'local'
  let error = ''
  let generation = 0
  let inflight = null
  let syncTimer = null
  let retryCount = 0
  let connecting = false

  const snapshot = () => ({
    items: visibleSubscriptions(document), key, status, error, seed
  })
  const notify = () => onChange(snapshot())
  const persist = (nextDocument, nextKey = key, nextSeed = seed, nextWelcomeIds = welcomeIds) => {
    storage.set(STORAGE_KEY, { document: nextDocument, key: nextKey, seed: nextSeed, welcomeIds: nextWelcomeIds })
    document = nextDocument
    key = nextKey
    seed = nextSeed
    welcomeIds = nextWelcomeIds
    notify()
  }
  const clearSyncTimer = () => {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = null
  }
  const withoutWelcome = (source, ids) => ids.length
    ? { ...source, subscriptions: source.subscriptions.filter((item) => !ids.includes(item.id)) }
    : source
  const schedule = (delay = 900) => {
    if (!key || connecting) return
    clearSyncTimer()
    syncTimer = setTimeout(() => { void syncNow().catch(() => {}) }, delay)
  }
  const fail = (reason, retryable = false) => {
    error = reason.message || 'Synchronization failed'
    status = reason.status === 404 ? 'missing' : 'error'
    notify()
    if (retryable && key && retryCount < 5) {
      const delay = Math.min(60000, 2000 * (2 ** retryCount)) + Math.floor(Math.random() * 500)
      retryCount++
      schedule(delay)
    }
  }

  function mutate(id, changes) {
    const now = nextTimestamp(document, clock())
    const changeId = generateUserKey(cryptoImpl)
    const existing = document.subscriptions.find((item) => item.id === id)
    if (id && !existing) return
    const mutation = changes.deletedAt === 'delete' ? { ...changes, deletedAt: now } : changes
    const updated = existing
      ? document.subscriptions.map((item) => item.id === id ? { ...item, ...mutation, updatedAt: now, changeId } : item)
      : [...document.subscriptions, { ...mutation, id: generateUserKey(cryptoImpl), updatedAt: now, changeId }]
    persist({ ...document, subscriptions: updated }, key, false,
      existing ? welcomeIds.filter((welcomeId) => welcomeId !== id) : welcomeIds)
    status = key ? 'pending' : 'local'
    error = ''
    notify()
    schedule()
  }

  async function connect(rawKey, { existing = false } = {}) {
    const nextKey = validateUserKey(typeof rawKey === 'string' ? rawKey.trim() : rawKey)
    const token = ++generation
    clearSyncTimer()
    inflight = null
    connecting = true
    status = 'connecting'
    error = ''
    notify()
    try {
      const remote = await client.read(nextKey)
      if (token !== generation) return
      if (!remote && existing) throw new Error('That sync key does not exist')
      if (remote) validateDocument(remote.json)
      const initial = remote ? withoutWelcome(document, welcomeIds) : document
      const merged = remote ? mergeDocuments(initial, remote.json) : document
      if (token !== generation) return
      if (!remote || !documentsEqual(merged, remote.json)) await client.write(nextKey, merged)
      if (token !== generation) return
      const current = mergeDocuments(remote ? withoutWelcome(document, welcomeIds) : document, merged)
      persist(current, nextKey, false, [])
      retryCount = 0
      status = documentsEqual(current, merged) ? 'synced' : 'pending'
      notify()
    } catch (reason) {
      if (token === generation) fail(reason)
      throw reason
    } finally {
      if (token === generation) {
        connecting = false
        if (key && status !== 'synced') schedule()
      }
    }
  }

  async function syncNow() {
    if (!key || connecting) return
    if (inflight) return inflight
    const token = generation
    const activeKey = key
    clearSyncTimer()
    status = 'syncing'
    notify()
    const work = (async () => {
      try {
        const remote = await client.read(activeKey)
        if (token !== generation) return
        if (!remote) {
          const missing = new Error('Shared data is missing; local changes are safe')
          missing.status = 404
          throw missing
        }
        validateDocument(remote.json)
        const merged = mergeDocuments(document, remote.json)
        if (!documentsEqual(document, merged)) persist(merged)
        if (!documentsEqual(merged, remote.json)) {
          await client.write(activeKey, merged)
          if (token !== generation) return
          const latest = await client.read(activeKey)
          if (token !== generation) return
          if (!latest) throw new Error('Shared data disappeared during synchronization')
          validateDocument(latest.json)
          const reconciled = mergeDocuments(document, latest.json)
          if (!documentsEqual(document, reconciled)) persist(reconciled)
          if (!documentsEqual(reconciled, latest.json)) {
            status = 'pending'
            schedule(1000)
            return
          }
        }
        if (token !== generation) return
        retryCount = 0
        error = ''
        status = 'synced'
        notify()
      } catch (reason) {
        if (token === generation) fail(reason, !reason.status || reason.status === 429 || reason.status >= 500)
        throw reason
      } finally {
        if (inflight === work) inflight = null
      }
    })()
    inflight = work
    return work
  }

  function disconnect() {
    generation++
    clearSyncTimer()
    inflight = null
    persist(document, '', false, [])
    status = 'local'
    error = ''
    notify()
  }

  notify()
  return {
    snapshot,
    add: (item) => mutate(null, { ...item, deletedAt: null }),
    remove: (id) => mutate(id, { deletedAt: 'delete' }),
    restore: (id) => mutate(id, { deletedAt: null }),
    connect, syncNow, disconnect,
    dispose() {
      generation++
      clearSyncTimer()
    },
    start() {
      if (key) schedule(0)
      if (typeof window === 'undefined') return
      window.addEventListener('online', () => schedule(0))
      documentVisibility()
      window.setInterval(documentVisibility, 60000)
      window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) return
        const current = storage.getItem(STORAGE_KEY)
        if (!current) return
        try {
          validateDocument(current.document)
          const changedKey = current.key !== key
          if (changedKey) {
            generation++
            clearSyncTimer()
            inflight = null
            connecting = false
          }
          const localDocument = changedKey && current.key
            ? withoutWelcome(document, welcomeIds) : document
          const merged = mergeDocuments(localDocument, current.document)
          const nextSeed = seed && current.seed === true
          const nextWelcomeIds = changedKey ? (current.welcomeIds || [])
            : welcomeIds.filter((id) => (current.welcomeIds || []).includes(id))
          if (changedKey || !documentsEqual(merged, document) || seed !== nextSeed ||
            !documentsEqual(welcomeIds, nextWelcomeIds)) {
            persist(merged, current.key || '', nextSeed, nextWelcomeIds)
            status = key ? 'pending' : 'local'
            notify()
            schedule()
          }
        } catch { /* Ignore an invalid value from another tab. */ }
      })
      function documentVisibility() {
        if (window.document.visibilityState === 'visible') schedule(0)
      }
      window.document.addEventListener('visibilitychange', documentVisibility)
    }
  }
}
