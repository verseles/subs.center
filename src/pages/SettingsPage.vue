<template>
  <q-page class="q-pa-md" style="max-width: 640px; margin: auto">
    <q-btn flat icon="arrow_back" label="Subscriptions" to="/" />
    <h1 class="text-h5">Settings</h1>

    <h2 class="text-h6">Theme</h2>
    <q-option-group v-model="theme" :options="themeOptions" type="radio" @update:model-value="saveTheme" />

    <h2 class="text-h6 q-mt-lg">Sync between devices</h2>
    <p>Anyone who knows your key can read, change or delete your shared data. This storage is public and is not encrypted.</p>
    <q-input
      v-model="draftKey"
      label="Sync key"
      hint="Keep this key to connect another device"
      maxlength="95"
      autocomplete="off"
    />
    <div class="q-gutter-sm q-mt-md">
      <q-btn color="primary" label="Create / connect" :loading="busy" @click="connect(false)" />
      <q-btn outline label="Use existing key" :loading="busy" @click="connect(true)" />
      <q-btn flat label="Generate key" @click="generate" />
      <q-btn flat label="Copy key" :disable="!validDraftKey" @click="copy" />
      <q-btn flat label="Disconnect" :disable="!subscriptions.key" @click="disconnect" />
    </div>
    <div class="q-mt-md">Status: {{ subscriptions.status }}</div>
    <div v-if="subscriptions.error" class="text-negative" role="alert">{{ subscriptions.error }}</div>
    <q-btn v-if="subscriptions.key" class="q-mt-sm" flat label="Sync now" @click="refresh" />
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import {
  subscriptions, connectSubscriptions, disconnectSubscriptions, syncSubscriptions
} from 'src/services/subscriptions'
import { generateUserKey, validateUserKey } from 'src/services/kvClient.mjs'

const $q = useQuasar()
const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
]
const theme = ref($q.localStorage.getItem('subs.theme') || 'dark')
const draftKey = ref(subscriptions.key)
const busy = ref(false)
watch(() => subscriptions.key, (key) => { draftKey.value = key })
const validDraftKey = computed(() => {
  try { validateUserKey(draftKey.value); return true } catch { return false }
})

function saveTheme(value) {
  $q.localStorage.set('subs.theme', value)
  $q.dark.set(value === 'system' ? 'auto' : value === 'dark')
}

function generate() {
  try { draftKey.value = generateUserKey() } catch (error) { $q.notify({ type: 'negative', message: error.message }) }
}

async function connect(existing) {
  busy.value = true
  try {
    await connectSubscriptions(draftKey.value, { existing })
    draftKey.value = subscriptions.key
    $q.notify({ message: 'Sync connected' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    busy.value = false
  }
}

async function copy() {
  try {
    await copyToClipboard(draftKey.value)
    $q.notify({ message: 'Key copied' })
  } catch {
    $q.notify({ type: 'negative', message: 'Copy failed' })
  }
}

function disconnect() {
  disconnectSubscriptions()
  draftKey.value = ''
}

async function refresh() {
  try { await syncSubscriptions() } catch { /* Error is displayed in status. */ }
}
</script>
