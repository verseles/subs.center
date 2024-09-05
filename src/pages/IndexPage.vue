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
import { computed, onBeforeMount, reactive, ref, watchPostEffect, onMounted } from 'vue'
import AddSubscription from 'components/AddSubscription.vue'
import { onlyHost } from 'components/onlyHost'
import { welcomeItems } from 'components/welcomeItems'
import { useQuasar } from 'quasar'
import { Currency } from '@depay/local-currency'

let items = reactive(welcomeItems)

onBeforeMount(() => {
  const savedItems = $q.localStorage.getItem('subscriptions')
  if (savedItems) {
    items = reactive(savedItems)
  }
})

onMounted(() => {
  $q.notify({
    message: 'Slide an item to delete it'
  })
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
const injectNewSubscription = (item) => {
  items.push({ ...item, id: items.length + 1 })
  items.sort((a, b) => (a.title < b.title ? -1 : 1))
}

const addDialog = ref(false)
</script>
