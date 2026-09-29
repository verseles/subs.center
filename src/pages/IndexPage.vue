<template>
  <q-page>
    <q-list>
      <q-slide-item
        v-for="item in subscriptions.items"
        :key="item.id"
        class="q-my-sm"
        right-color="negative"
        @right="({ reset }) => deleteItem({ item, reset })"
      >
        <template v-slot:right>
          <q-icon name="delete" />
        </template>
        <q-item>
          <q-item-section avatar>
            <q-avatar :square="item.square">
              <subscription-favicon
                :url="item.url"
                @loaded="rememberFavicon(item, $event)"
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
          </q-item-section>

          <q-item-section side>{{ money(item.cost) }}</q-item-section>
        </q-item>
      </q-slide-item>
    </q-list>
    <q-page-sticky :offset="[18, 18]" position="bottom-right">
      <div class="text-bold q-mr-sm inline-block">{{ money(totalCost) }}</div>
      <q-btn :ripple="false" color="primary" fab icon="add" @click="addDialog = true" />
    </q-page-sticky>

    <q-dialog v-model="addDialog" position="top">
      <add-subscription :items="subscriptions.items" @add="injectNewSubscription" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import AddSubscription from 'components/AddSubscription.vue'
import SubscriptionFavicon from 'components/SubscriptionFavicon.vue'
import { onlyHost } from 'components/onlyHost'
import { useQuasar } from 'quasar'
import { Currency } from '@depay/local-currency'
import {
  subscriptions, addSubscription, removeSubscription, restoreSubscription
} from 'src/services/subscriptions'

onMounted(() => {
  $q.notify({
    message: 'Slide an item to delete it'
  })
})

const $q = useQuasar()
const loadedFavicons = new WeakMap()
const rememberFavicon = (item, url) => {
  loadedFavicons.set(item, { host: onlyHost(item.url), url })
}
const deleteItem = ({ item, reset }) => {
  removeSubscription(item.id)
  $q.notify({
    message: 'Subscription removed',
    color: 'neutral',
    avatar: favicon(item),
    actions: [
      {
        label: 'undo',
        handler: () => {
          restoreSubscription(item.id)
        }
      }
    ]
  })
  reset()
}

const favicon = (item) => {
  const host = onlyHost(item.url)
  const loaded = loadedFavicons.get(item)
  if (loaded?.host === host) return loaded.url

  let domain = host
  try {
    domain = new URL(`https://${host}`).hostname
  } catch {
    domain = host
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}

const totalCost = computed(() => subscriptions.items.reduce((acc, item) => acc + Math.ceil(item.cost), 0))
const money = (value) => {
  return new Currency({ amount: value }).toString({
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })
}
const injectNewSubscription = (item) => {
  addSubscription(item)
}

const addDialog = ref(false)
</script>
