<script setup>
import { reactive } from 'vue'
import { NButton, NInput } from 'naive-ui'

let newSub = reactive({
  title: '',
  cost: null,
  url: ''
})

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add'])

const onlyHost = (url) => url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]+)/i)[1]

const resetAddForm = () => {
  newSub.title = ''
  newSub.cost = null
  newSub.url = ''
}

const addSubscription = () => {
  const id = props.items.length + 1
  const title = newSub.title
  const cost = parseFloat(newSub.cost)
  const url = newSub.url
  emit('add', { id, title, cost, url })

  resetAddForm()
}
</script>

<template>
  <form class="flex flex-row flex-wrap mx-4" @submit.prevent="addSubscription">
    <n-input placeholder="Title" v-model:value="newSub.title" />
    <n-input placeholder="R$" v-model:value="newSub.cost" type="number" />
    <n-input
      placeholder="site.com"
      v-model:value="newSub.url"
      @input.passive="newSub.url = onlyHost(newSub.url)"
    />
    <n-button type="primary" attr-type="submit">Add</n-button>
  </form>
</template>

<style></style>
