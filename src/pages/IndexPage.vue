<template>
  <q-page>
    <q-list>
      <q-item v-for="item in items" :key="item.id" class="q-my-sm" clickable>
        <q-item-section avatar>
          <q-avatar>
            <img :src="favicon(item)" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
<!--          <q-item-label caption lines="1">{{ item.cost }}</q-item-label>-->
        </q-item-section>

        <q-item-section side>
         R$ {{ item.cost }}
        </q-item-section>
      </q-item>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" :ripple="false" />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import {computed, reactive} from 'vue'
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
</script>
