<template>
  <img
    v-if="source && !failed"
    :key="source"
    :src="source"
    alt=""
    referrerpolicy="no-referrer"
    @error="loadNext"
    @load="rememberLoaded"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onlyHost } from 'components/onlyHost'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['loaded'])

const faviconPaths = [
  '/apple-touch-icon.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon-180x180.png',
  '/android-chrome-192x192.png',
  '/favicon-192x192.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
]

const candidateIndex = ref(0)
const failed = ref(false)

const parsedUrl = computed(() => {
  const value = onlyHost(props.url).trim()
  if (!value) return null

  try {
    return new URL(`https://${value}`)
  } catch {
    return null
  }
})

const candidates = computed(() => {
  if (!parsedUrl.value) return []

  return [
    ...faviconPaths.map((path) => `${parsedUrl.value.origin}${path}`),
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsedUrl.value.hostname)}&sz=128`
  ]
})

const source = computed(() => candidates.value[candidateIndex.value] || '')

watch(parsedUrl, () => {
  candidateIndex.value = 0
  failed.value = false
})

const isCurrentSource = (event) => event.currentTarget?.getAttribute('src') === source.value

const loadNext = (event) => {
  if (!isCurrentSource(event)) return

  if (candidateIndex.value < candidates.value.length - 1) {
    candidateIndex.value += 1
  } else {
    failed.value = true
  }
}

const rememberLoaded = (event) => {
  if (isCurrentSource(event) && event.currentTarget.naturalWidth > 0) {
    emit('loaded', source.value)
  }
}
</script>
