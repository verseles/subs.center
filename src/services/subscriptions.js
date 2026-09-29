import { reactive } from 'vue'
import { createSubscriptionStore } from './subscriptionStore.mjs'
import { welcomeItems } from 'components/welcomeItems'

export const subscriptions = reactive({ items: [], key: '', status: 'local', error: '', seed: true })
let controller

export function initializeSubscriptions(storage) {
  if (controller) return
  controller = createSubscriptionStore({
    storage,
    welcomeItems,
    onChange: (snapshot) => Object.assign(subscriptions, snapshot)
  })
  controller.start()
}

export const addSubscription = (item) => controller.add(item)
export const removeSubscription = (id) => controller.remove(id)
export const restoreSubscription = (id) => controller.restore(id)
export const connectSubscriptions = (key, options) => controller.connect(key, options)
export const disconnectSubscriptions = () => controller.disconnect()
export const syncSubscriptions = () => controller.syncNow()
