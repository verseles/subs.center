<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-accent text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="subscriptions" />
          My Subscriptions
        </q-toolbar-title>
        <q-btn flat round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" :ripple="false" @click="$q.dark.toggle" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>
