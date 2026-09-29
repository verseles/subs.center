export const SCHEMA_VERSION = 1

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const stableStringify = (value) => JSON.stringify(value, (_key, item) => {
  if (!isObject(item)) return item
  return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
})

export const documentsEqual = (left, right) => stableStringify(left) === stableStringify(right)

function legacyId(item, occurrence) {
  const text = stableStringify([item.title, item.url])
  let hash = 2166136261
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `legacy-${(hash >>> 0).toString(16)}-${occurrence}`
}

export function migrateLegacy(items) {
  if (!Array.isArray(items)) throw new Error('Invalid saved subscriptions')
  const occurrences = new Map()
  return items.map((item) => {
    if (!isObject(item) || typeof item.title !== 'string' || typeof item.url !== 'string' || !Number.isFinite(Number(item.cost))) {
      throw new Error('Invalid saved subscription')
    }
    const identity = stableStringify([item.title, item.url])
    const occurrence = (occurrences.get(identity) || 0) + 1
    occurrences.set(identity, occurrence)
    const { id: _oldId, ...fields } = item
    return { ...fields, id: legacyId(item, occurrence), updatedAt: 0, changeId: 'legacy' }
  })
}

export function validateDocument(value) {
  if (!isObject(value) || value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.subscriptions)) {
    throw new Error('Unsupported or invalid sync document')
  }
  const seen = new Set()
  for (const item of value.subscriptions) {
    if (!isObject(item) || typeof item.id !== 'string' || !item.id || seen.has(item.id) ||
      typeof item.title !== 'string' || typeof item.url !== 'string' || !Number.isFinite(Number(item.cost)) ||
      !Number.isSafeInteger(item.updatedAt) || item.updatedAt < 0 || item.updatedAt === Number.MAX_SAFE_INTEGER || typeof item.changeId !== 'string' ||
      (item.deletedAt !== undefined && item.deletedAt !== null &&
        (!Number.isSafeInteger(item.deletedAt) || item.deletedAt < 0))) {
      throw new Error('Invalid sync document')
    }
    seen.add(item.id)
  }
  return value
}

export function newDocument(items = []) {
  return { schemaVersion: SCHEMA_VERSION, subscriptions: items }
}

function winningRecord(local, remote) {
  if (local.updatedAt !== remote.updatedAt) return local.updatedAt > remote.updatedAt ? local : remote
    if ((local.deletedAt != null) !== (remote.deletedAt != null)) return local.deletedAt != null ? local : remote
  if (local.changeId === 'legacy' && remote.changeId === 'legacy') return remote
  if (local.changeId !== remote.changeId) return local.changeId > remote.changeId ? local : remote
  return stableStringify(local) > stableStringify(remote) ? local : remote
}

export function mergeDocuments(local, remote) {
  validateDocument(local)
  validateDocument(remote)
  const records = new Map(remote.subscriptions.map((item) => [item.id, item]))
  for (const item of local.subscriptions) {
    const other = records.get(item.id)
    if (!other) {
      records.set(item.id, item)
      continue
    }
    const winner = winningRecord(item, other)
    const loser = winner === item ? other : item
    const combined = { ...loser, ...winner }
    if (winner.deletedAt == null && loser.deletedAt != null) combined.deletedAt = null
    records.set(item.id, combined)
  }
  return { ...local, ...remote, schemaVersion: SCHEMA_VERSION,
    subscriptions: [...records.values()].sort((a, b) => a.id.localeCompare(b.id)) }
}

export function nextTimestamp(document, now) {
  const latest = document.subscriptions.reduce((max, item) => Math.max(max, item.updatedAt), 0)
  const next = Math.max(now, latest + 1)
  if (!Number.isSafeInteger(next) || next === Number.MAX_SAFE_INTEGER) {
    throw new Error('Subscription timestamp limit reached')
  }
  return next
}

export function visibleSubscriptions(document) {
  return document.subscriptions.filter((item) => item.deletedAt == null)
    .sort((a, b) => a.title.localeCompare(b.title))
}
