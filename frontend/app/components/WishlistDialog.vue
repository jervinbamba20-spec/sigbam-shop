<template>
  <v-dialog v-model="open" max-width="560" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-heart" color="error" class="mr-2" />
        My Wishlist
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="open = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <v-empty-state
          v-if="wishItems.length === 0"
          icon="mdi-heart-outline"
          title="Your wishlist is empty"
          text="Tap the heart on a product to save it here."
        />
        <v-list v-else lines="two">
          <v-list-item v-for="p in wishItems" :key="p.documentId">
            <template #prepend>
              <v-avatar size="56" color="background">
                <v-img v-if="p.image" :src="mediaUrl(p.image, 'thumbnail')" cover />
                <v-icon v-else :icon="categoryIcon(p.category)" color="primary" />
              </v-avatar>
            </template>
            <v-list-item-title>{{ p.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatPrice(p.price) }} ·
              <span :class="p.stock > 0 ? 'text-success' : 'text-error'">
                {{ p.stock > 0 ? `${p.stock} in stock` : 'Out of stock' }}
              </span>
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                icon="mdi-cart-plus"
                variant="text"
                color="primary"
                :disabled="p.stock <= 0"
                aria-label="Add to cart"
                @click="addToCart(p)"
              />
              <v-btn
                icon="mdi-heart-remove"
                variant="text"
                color="error"
                aria-label="Remove from wishlist"
                @click="toggleWishlist(p)"
              />
            </template>
          </v-list-item>
        </v-list>
        <p v-if="missing > 0" class="text-caption text-medium-emphasis px-4 pb-3">
          {{ missing }} saved item(s) are no longer available and are hidden.
        </p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const { wishlist, addToCart, toggleWishlist } = useCart()
const { products, ensureLoaded } = useProducts()
const { mediaUrl } = useStrapi()

watch(open, (v) => { if (v) ensureLoaded() })

const wishItems = computed(() => products.value.filter((p) => wishlist.value.includes(p.documentId)))
const missing = computed(() => (products.value.length ? wishlist.value.length - wishItems.value.length : 0))
</script>
