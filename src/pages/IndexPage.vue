<template>
  <q-page>
    <q-list>
      <q-slide-item v-for="item in items" :key="item.id" class="q-my-sm" @right="({reset}) => deleteItem({item, reset})" right-color="negative">
        <template v-slot:right>
          <q-icon name="delete" />
        </template>
        <q-item>
          <q-item-section avatar>
            <q-avatar square>
              <img :src="favicon(item)" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            R$ {{ item.cost }}
          </q-item-section>
        </q-item>
      </q-slide-item>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" :ripple="false" @click="addDialog = true" />
    </q-page-sticky>
    <q-dialog v-model="addDialog" position="top">
      <q-card class="q-px-lg q-pt-lg">
        <q-select
          :model-value="newSub.title"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="subSuggestions"
          @filter="filterSuggestions"
          @input-value="selectNewSubscription"
          label="Service Name"
          class="q-mb-md"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No suggestions found
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="newSub.cost"
          label="Monthly Cost"
          input-class="text-right"
          class="q-mb-md"
        />

        <q-input
          v-model="newSub.url"
          label="Site"
          class="q-mb-md"
          @update:model-value="newSub.url = onlyHost($event)"
        />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Add" color="accent" v-close-popup @click="injectNewSubscription(newSub)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import {computed, reactive, ref} from 'vue'

const deleteItem = ({item, reset}) => {
  items.splice(items.indexOf(item), 1)
  reset()
}


const newSub = reactive({title: '',cost : 0,url  : ''})


const subSuggestions = [
  {
    label: 'Netflix',
    title: 'Netflix',
    cost : 56,
    url  : 'netflix.com'
  },
  {
    label: 'Spotify',
    title: 'Spotify',
    cost : 16,
    url  : 'spotify.com'
  },
  {
    label: 'Amazon Prime',
    title: 'Amazon Prime',
    cost : 9,
    url  : 'primevideo.com'
  },
  {
    label: 'Disney+',
    title: 'Disney+',
    cost : 28,
    url  : 'disneyplus.com'
  },
  {
    label: 'HBO Max',
    title: 'HBO Max',
    cost : 28,
    url  : 'hbomax.com'
  },
  {
    label: 'Globo Play',
    title: 'Globo Play',
    cost : 22,
    url  : 'globoplay.com'
  },
  {
    label: 'Telecine',
    title: 'Telecine',
    cost : 37,
    url  : 'telecineplay.com'
  },
  {
    label: 'Paramount+',
    title: 'Paramount+',
    cost : 20,
    url  : 'paramountplus.com'
  },
  {
    label: 'Apple TV+',
    title: 'Apple TV+',
    cost : 10,
    url  : 'apple.com'
  },
  {
    label: 'Globoplay',
    title: 'Globoplay',
    cost : 25,
    url  : 'globoplay.com'
  }
]

const selectNewSubscription = (item) => {
  const findSubItem = subSuggestions.find((v) => v.title === item)

  if (!findSubItem) {
    return
  }

  newSub.title      = findSubItem.label
  newSub.cost       = findSubItem.cost
  newSub.url        = findSubItem.url
}

const filterSuggestions = (val, update) => {
  if (val === '') {
    update(() => {
      return subSuggestions
    })
  }
  else {
    const needle = val.toLowerCase()
    update(() => {
      return subSuggestions.filter((v) => v.title.toLowerCase().indexOf(needle) > -1)
    })
  }
}
const onlyHost          = (url) => {
  return url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .split('/')[0]
}
const favicon           = (item) => `https://www.google.com/s2/favicons?domain=${onlyHost(item.url)}&sz=128`

const totalCost             = computed(() => items.reduce((acc, item) => acc + item.cost, 0))
const injectNewSubscription = (item) => items.push({...item, id: items.length + 1})

const removeSubscription = (id) => {
  const index = items.findIndex((item) => item.id === id)
  items.splice(index, 1)
}
const addDialog          = ref(false);
let items                = reactive([
                                      {
                                        id   : 1,
                                        title: 'Nerdflix',
                                        cost : 56,
                                        url  : 'netflix.com'
                                      },
                                      {
                                        id   : 2,
                                        title: 'Spotify',
                                        cost : 16,
                                        url  : 'spotify.com'
                                      },
                                      {
                                        id   : 3,
                                        title: 'Amazon Prime',
                                        cost : 10,
                                        url  : 'primevideo.com'
                                      },
                                      {
                                        id   : 4,
                                        title: 'Disney+',
                                        cost : 27,
                                        url  : 'disneyplus.com'
                                      },
                                      {
                                        id   : 5,
                                        title: 'HBO Max',
                                        cost : 10,
                                        url  : 'hbomax.com'
                                      },
                                      {
                                        id   : 6,
                                        title: 'Apple Music',
                                        cost : 17,
                                        url  : 'music.apple.com'
                                      },
                                      {
                                        id   : 7,
                                        title: 'YouTube Premium',
                                        cost : 21,
                                        url  : 'youtube.com'
                                      },
                                      {
                                        id   : 8,
                                        title: 'Twitch',
                                        cost : 0,
                                        url  : 'twitch.tv'
                                      },
                                      {
                                        id   : 9,
                                        title: 'Discord Nitro',
                                        cost : 28,
                                        url  : 'discord.com'
                                      },
                                      {
                                        id   : 10,
                                        title: 'Apple TV+',
                                        cost : 14,
                                        url  : 'apple.com'
                                      }
                                    ])
</script>
