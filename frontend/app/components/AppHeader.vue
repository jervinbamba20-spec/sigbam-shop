<template>
  <v-app-bar color="surface" flat border="b" height="72">
    <div class="page-wrap d-flex align-center w-100 ga-4">
      <!-- Logo -->
      <NuxtLink to="/" class="d-flex align-center text-decoration-none flex-shrink-0">
        <v-avatar color="primary" rounded="lg" size="38" class="mr-2">
          <v-icon icon="mdi-shopping" size="22" />
        </v-avatar>
        <span class="text-h6 font-weight-bold text-high-emphasis">Shop<span class="text-primary">Kart</span></span>
      </NuxtLink>

      <!-- Search (tablet/desktop) -->
      <v-text-field
        v-if="!mobile"
        v-model="search"
        placeholder="Search products, categories..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="solo-filled"
        flat
        rounded="pill"
        hide-details
        clearable
        class="mx-auto"
        style="max-width: 560px"
        @update:model-value="goToResults"
      />
      <v-spacer v-else />

      <!-- Actions -->
      <div class="d-flex align-center ga-1 flex-shrink-0">
        <v-btn
          to="/products"
          variant="text"
          :icon="mobile"
          aria-label="Manage Products"
          class="text-medium-emphasis"
        >
          <v-icon icon="mdi-view-dashboard-outline" :start="!mobile" />
          <span v-if="!mobile">Manage Products</span>
        </v-btn>

        <v-btn icon variant="text" aria-label="Wishlist" @click="emit('open-wishlist')">
          <v-badge :content="wishlist.length" :model-value="wishlist.length > 0" color="secondary">
            <v-icon icon="mdi-heart-outline" />
          </v-badge>
        </v-btn>

        <v-btn icon variant="text" aria-label="Shopping cart" @click="drawer = !drawer">
          <v-badge :content="totalItems" :model-value="totalItems > 0" color="secondary">
            <v-icon icon="mdi-cart-outline" />
          </v-badge>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const emit = defineEmits<{ 'open-wishlist': [] }>()
const { smAndDown: mobile } = useDisplay()
const { totalItems, wishlist, drawer } = useCart()
const { search } = useShopFilters()
const route = useRoute()

// Searching from another page takes the user to the product grid
function goToResults(value: string | null) {
  if (value && route.path !== '/') navigateTo('/#products')
}
</script>
