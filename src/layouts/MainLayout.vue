<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="subscriptions" />
          My Subscriptions
        </q-toolbar-title>
        <q-btn
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :ripple="false"
          flat
          round
          @click="$q.dark.toggle"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup></script>
