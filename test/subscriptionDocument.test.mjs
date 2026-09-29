import test from 'node:test'
import assert from 'node:assert/strict'
import {
  documentsEqual, mergeDocuments, migrateLegacy, newDocument, validateDocument,
  visibleSubscriptions, nextTimestamp
} from '../src/services/subscriptionDocument.mjs'

const record = (id, updatedAt, extra = {}) => ({
  id, title: id, cost: 10, url: 'example.com', updatedAt, changeId: `change-${updatedAt}`, ...extra
})

test('legacy IDs are stable across devices and duplicate old numeric IDs do not collide', () => {
  const old = [
    { id: 1, title: 'A', cost: 10, url: 'a.com' },
    { id: 1, title: 'B', cost: 20, url: 'b.com' },
    { id: 1, title: 'A', cost: 10, url: 'a.com' }
  ]
  const migrated = migrateLegacy(old)
  assert.deepEqual(migrated, migrateLegacy(old))
  assert.equal(new Set(migrated.map((item) => item.id)).size, 3)
  assert.deepEqual(migrated.map((item) => item.updatedAt), [0, 0, 0])
})

test('merge keeps newer entries, both additions, unknown fields and remote sibling keys', () => {
  const local = { ...newDocument([record('shared', 9, { future: 'kept' }), record('local', 4)]), localFuture: 1 }
  const remote = { ...newDocument([record('shared', 8), record('remote', 5)]), remoteFuture: { enabled: true } }
  const merged = mergeDocuments(local, remote)
  assert.deepEqual(merged.subscriptions.map((item) => item.id), ['local', 'remote', 'shared'])
  assert.equal(merged.subscriptions[2].future, 'kept')
  assert.deepEqual(merged.remoteFuture, { enabled: true })
  assert.equal(merged.localFuture, 1)
  assert.ok(documentsEqual(merged, mergeDocuments(merged, remote)))
  assert.equal(mergeDocuments(newDocument([record('shared', 1)]), remote)
    .subscriptions.find((item) => item.id === 'shared').updatedAt, 8)
})

test('delete wins an equal-time tie, newer undo wins, legacy tie favors remote', () => {
  const alive = record('a', 10)
  const deleted = record('a', 10, { deletedAt: 10 })
  const merged = mergeDocuments(newDocument([deleted]), newDocument([alive]))
  assert.equal(visibleSubscriptions(merged).length, 0)
  assert.equal(visibleSubscriptions(mergeDocuments(newDocument([record('a', 11)]), merged)).length, 1)
  const oldLocal = record('a', 0, { title: 'local', changeId: 'legacy' })
  const oldRemote = record('a', 0, { title: 'remote', changeId: 'legacy' })
  assert.equal(mergeDocuments(newDocument([oldLocal]), newDocument([oldRemote])).subscriptions[0].title, 'remote')
})

test('refuse unknown schemas and malformed records instead of overwriting data', () => {
  assert.throws(() => validateDocument({ schemaVersion: 2, subscriptions: [] }))
  assert.throws(() => validateDocument(newDocument([record('a', 1), record('a', 2)])))
  assert.throws(() => validateDocument(newDocument([{ ...record('a', 1), updatedAt: 'yesterday' }])))
  assert.throws(() => validateDocument(newDocument([record('a', Number.MAX_SAFE_INTEGER)])))
})

test('legacy ID stays stable when a subscription cost changes', () => {
  assert.equal(migrateLegacy([{ title: 'A', cost: 10, url: 'a.com' }])[0].id,
    migrateLegacy([{ title: 'A', cost: 20, url: 'a.com' }])[0].id)
})

test('a zero-valued tombstone is not displayed', () => {
  assert.equal(visibleSubscriptions(newDocument([record('deleted', 0, { deletedAt: 0 })])).length, 0)
})

test('near-maximum timestamps reject a mutation before making state invalid', () => {
  const valid = newDocument([record('near-limit', Number.MAX_SAFE_INTEGER - 1)])
  validateDocument(valid)
  assert.throws(() => nextTimestamp(valid, 100), /timestamp limit/)
  assert.doesNotThrow(() => validateDocument(valid))
})
