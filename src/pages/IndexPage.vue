<template>
  <q-page>
    <q-list>
      <q-slide-item
        v-for="item in items"
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
              <img :src="favicon(item)" />
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
      <add-subscription :items="items" @add="injectNewSubscription" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref, watchPostEffect } from 'vue'
import AddSubscription from 'components/AddSubscription.vue'
import { onlyHost } from 'components/onlyHost'
import { useQuasar } from 'quasar'
import { Currency } from '@depay/local-currency'

const welcomeItems = reactive([
  {
    id: 1,
    title: 'Netflix',
    cost: 56,
    url: 'netflix.com',
    square: true
  },
  {
    id: 2,
    title: 'Spotify',
    cost: 16,
    url: 'spotify.com'
  },
  {
    id: 3,
    title: 'Amazon Prime',
    cost: 10,
    url: 'primevideo.com'
  },
  {
    id: 4,
    title: 'Disney+',
    cost: 27,
    url: 'disneyplus.com'
  },
  {
    id: 5,
    title: 'HBO Max',
    cost: 10,
    url: 'hbomax.com'
  },
  {
    id: 6,
    title: 'Apple Music',
    cost: 17,
    url: 'music.apple.com'
  },
  {
    id: 7,
    title: 'YouTube Premium',
    cost: 21,
    url: 'youtube.com',
    square: true
  },
  {
    id: 8,
    title: 'Twitch',
    cost: 0,
    url: 'twitch.tv'
  },
  {
    id: 9,
    title: 'Discord Nitro',
    cost: 28,
    url: 'discord.com'
  },
  {
    id: 10,
    title: 'Apple TV+',
    cost: 14,
    url: 'apple.com'
  }
])

let items = welcomeItems

onBeforeMount(() => {
  const savedItems = $q.localStorage.getItem('subscriptions')
  if (savedItems) {
    items = reactive(savedItems)
  }
})

watchPostEffect(() => {
  if (Number.isInteger(totalCost.value)) {
    $q.localStorage.set('subscriptions', items)
  }
})

const $q = useQuasar()
const deleteItem = ({ item, reset }) => {
  const pos = items.indexOf(item)
  items.splice(pos, 1)
  $q.notify({
    message: 'Subscription removed',
    color: 'neutral',
    avatar: favicon(item),
    actions: [
      {
        label: 'undo',
        handler: () => {
          items.splice(pos, 0, item)
        }
      }
    ]
  })
  reset()
}

const favicon = (item) => `https://www.google.com/s2/favicons?domain=${onlyHost(item.url)}&sz=128`

const totalCost = computed(() => items.reduce((acc, item) => acc + Math.ceil(item.cost), 0))
const money = (value) => {
  return new Currency({ amount: value }).toString({
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })
}
const injectNewSubscription = (item) => items.push({ ...item, id: items.length + 1 })

const addDialog = ref(false)
</script>
