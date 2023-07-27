<script setup>
import { reactive } from 'vue'
import {
  subsSuggestions,
  subsSuggestionsOptions,
  subsSuggestionsString
} from 'components/subsSuggestions'
import { onlyHost } from 'components/onlyHost'
import { currencyPrefix } from 'components/currency'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

defineEmits(['add', 'close'])

const newSub = reactive({ title: '', cost: 0, url: '' })

const selectNewSubscription = (item) => {
  const findSubItem = subsSuggestions.find(
    (v) => v.title.toLocaleLowerCase() === item.toLocaleLowerCase()
  )
  if (!findSubItem) {
    newSub.title = item
    newSub.cost = 0
    newSub.url = ''
  } else {
    newSub.title = findSubItem.title
    newSub.cost = findSubItem.cost
    newSub.url = findSubItem.url
  }

  // newSub.title = findSubItem.label
  // newSub.cost = findSubItem.cost
  // newSub.url = findSubItem.url
}
const filterSuggestions = (val, update) => {
  return update(() => {
    return (subsSuggestionsOptions.value = subsSuggestionsString.filter((v) => {
      return v.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1
    }))
  })
}
</script>

<template>
  <q-card class="q-px-lg q-pt-lg">
    <q-select
      :model-value="newSub.title"
      :options="subsSuggestionsOptions"
      fill-input
      hide-selected
      input-debounce="0"
      label="Service Name"
      style="width: 250px; padding-bottom: 32px"
      use-input
      @filter="filterSuggestions"
      @input-value="selectNewSubscription"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No suggestions found</q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-input
      v-model="newSub.cost"
      :prefix="currencyPrefix()"
      class="q-mb-md"
      hide-hint
      hint="simplify to integer values"
      input-class="text-right"
      label="Monthly Cost"
      min="0"
      type="number"
    />

    <q-input
      v-model="newSub.url"
      class="q-mb-md"
      label="Site"
      type="url"
      @update:model-value="newSub.url = onlyHost($event)"
    />
    <q-card-actions align="right">
      <q-btn v-close-popup color="primary" flat label="Cancel" />
      <q-btn
        v-close-popup
        :disable="!newSub.title || !newSub.cost || !newSub.url"
        color="primary"
        flat
        label="Add"
        @click="$emit('add', newSub)"
      />
    </q-card-actions>
  </q-card>
</template>

<style scoped></style>
