<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="subscriptions" />
          My Subscriptions
        </q-toolbar-title>
        <q-btn
          icon="settings"
          aria-label="Settings"
          :ripple="false"
          flat
          round
          to="/settings"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup></script>
