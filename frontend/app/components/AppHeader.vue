<template>
  <v-app-bar color="primary" density="comfortable">
    <v-app-bar-title>
      <NuxtLink to="/" class="d-flex align-center text-white text-decoration-none">
        <v-icon icon="mdi-shopping" class="mr-2" />
        <span class="font-weight-bold">SigBam Shop</span>
      </NuxtLink>
    </v-app-bar-title>

    <template #append>
      <v-btn to="/" variant="text" :icon="mobile" aria-label="Home">
        <v-icon icon="mdi-home" :start="!mobile" />
        <span v-if="!mobile">Home</span>
      </v-btn>

      <v-btn to="/products" variant="text" :icon="mobile" aria-label="Manage Products">
        <v-icon icon="mdi-package-variant-closed" :start="!mobile" />
        <span v-if="!mobile">Manage Products</span>
      </v-btn>

      <v-btn icon aria-label="Wishlist" @click="emit('open-wishlist')">
        <v-badge :content="wishlist.length" :model-value="wishlist.length > 0" color="error">
          <v-icon icon="mdi-heart" />
        </v-badge>
      </v-btn>

      <v-btn icon aria-label="Shopping cart" @click="drawer = !drawer">
        <v-badge :content="totalItems" :model-value="totalItems > 0" color="error">
          <v-icon icon="mdi-cart" />
        </v-badge>
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const emit = defineEmits<{ 'open-wishlist': [] }>()
const { smAndDown: mobile } = useDisplay()
const { totalItems, wishlist, drawer } = useCart()
</script>
