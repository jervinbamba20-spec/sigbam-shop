<template>
  <AppHeader @open-wishlist="wishlistOpen = true" />
  <CartDrawer />
  <WishlistDialog v-model="wishlistOpen" />
  <v-main class="bg-background">
    <slot />
  </v-main>
  <AppFooter />
</template>

<script setup lang="ts">
const wishlistOpen = ref(false)
</script>
