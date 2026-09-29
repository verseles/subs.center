<template>
  <router-view />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { initializeSubscriptions } from 'src/services/subscriptions'

const $q = useQuasar()
const theme = $q.localStorage.getItem('subs.theme') || 'dark'
$q.dark.set(theme === 'system' ? 'auto' : theme === 'dark')
initializeSubscriptions($q.localStorage)
</script>
