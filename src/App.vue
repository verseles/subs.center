<script setup>
import { computed, h, reactive } from 'vue'
import AddSubscription from '@/components/addSubscription.vue'
import { NAvatar, NDataTable, NGradientText } from 'naive-ui'

const items = reactive([
  {
    id: 1,
    title: 'Nerdflix',
    cost: 56,
    url: 'netflix.com'
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
    url: 'youtube.com'
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

const onlyHost = (url) => {
  return url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .split('/')[0]
}
const favicon = (item) => `https://www.google.com/s2/favicons?domain=${onlyHost(item.url)}&sz=128`

const totalCost = computed(() => items.reduce((acc, item) => acc + item.cost, 0))
const injectNewSubscription = (item) => items.push(item)

const removeSubscription = (id) => {
  const index = items.findIndex((item) => item.id === id)
  items.splice(index, 1)
}

const columns = [
  {
    title: '',
    key: 'icon',
    width: '64px',
    render(row) {
      return h(NAvatar, {
        src: favicon(row),
        style: { color: 'black', backgroundColor: 'white' }
      })
    }
  },
  {
    title: 'Service',
    key: 'title',
    width: '80%',
    sorter: (row1, row2) => row1.title.localeCompare(row2.title)
    // resizable: true
  },
  {
    title: 'Cost',
    key: 'cost',
    width: '15%',
    sorter: (row1, row2) => row1.cost - row2.cost
    // resizable: true
  }
]
</script>

<template>
  <div class="flex flex-col items-center gap-7">
    <n-gradient-text type="info">My Subscriptions</n-gradient-text>

    <add-subscription :items="items" @add="injectNewSubscription" />

    <n-data-table :columns="columns" :data="items" />

    <div class="flex flex-row flex-wrap mx-4">
      <div class="w-5/6">Total</div>
      <div class="w-1/6">{{ totalCost }}</div>
    </div>
  </div>
</template>

<style scoped>
.n-gradient-text {
  font-size: 36px;
  text-align: center;
  width: 100%;
  margin-bottom: 1rem;
}
</style>
