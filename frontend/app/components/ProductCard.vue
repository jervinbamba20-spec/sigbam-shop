<template>
  <v-card class="product-card lift d-flex flex-column fill-height">
    <!-- Image (inset with rounded corners) -->
    <div class="pa-3 pb-0">
      <div class="img-box position-relative rounded-lg overflow-hidden bg-background">
        <v-img
          v-if="product.image"
          :src="mediaUrl(product.image, 'small')"
          :alt="product.name"
          aspect-ratio="1"
          cover
        >
          <template #error>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon icon="mdi-image-broken-variant" size="48" color="primary" />
            </div>
          </template>
        </v-img>
        <v-responsive v-else aspect-ratio="1">
          <div class="d-flex align-center justify-center fill-height">
            <v-icon :icon="categoryIcon(product.category)" size="72" color="primary" />
          </div>
        </v-responsive>

        <!-- Stock badge -->
        <v-chip
          v-if="product.stock <= 5"
          class="position-absolute font-weight-bold"
          style="top: 10px; left: 10px"
          color="secondary"
          variant="flat"
          size="small"
          :prepend-icon="product.stock <= 0 ? 'mdi-close-circle' : 'mdi-fire'"
        >
          {{ product.stock <= 0 ? 'Sold out' : `Only ${product.stock} left` }}
        </v-chip>

        <!-- Wishlist -->
        <v-btn
          class="position-absolute"
          style="top: 8px; right: 8px; box-shadow: var(--shadow-sm)"
          :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
          :color="liked ? 'secondary' : 'surface'"
          variant="flat"
          size="small"
          rounded="circle"
          :aria-label="liked ? 'Remove from wishlist' : 'Add to wishlist'"
          @click="toggleWishlist(product)"
        />
      </div>
    </div>

    <!-- Details -->
    <div class="pa-4 pt-3 d-flex flex-column flex-grow-1">
      <div class="eyebrow text-primary mb-1">{{ product.category }}</div>
      <div class="text-subtitle-1 font-weight-bold text-truncate-2 mb-1" style="line-height: 1.35">
        {{ product.name }}
      </div>
      <p class="text-body-2 text-medium-emphasis text-truncate-2 mb-3">
        {{ product.description || 'No description available.' }}
      </p>

      <v-spacer />

      <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
        <span class="text-h6 font-weight-bold text-no-wrap">{{ formatPrice(product.price) }}</span>
        <v-chip
          size="x-small"
          :color="product.stock > 0 ? 'primary' : 'secondary'"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
        </v-chip>
      </div>

      <v-btn
        block
        color="primary"
        variant="flat"
        height="44"
        rounded="lg"
        :prepend-icon="soldOut ? undefined : 'mdi-cart-plus'"
        :disabled="soldOut"
        @click="addToCart(product)"
      >
        {{ product.stock <= 0 ? 'Out of Stock' : inCart >= product.stock ? 'Max in Cart' : 'Add to Cart' }}
      </v-btn>
      <div v-if="inCart > 0" class="text-caption text-medium-emphasis text-center mt-2">
        <v-icon icon="mdi-check-circle" size="14" color="primary" /> {{ inCart }} in your cart
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useStrapi'

const props = defineProps<{ product: Product }>()
const { mediaUrl } = useStrapi()
const { addToCart, toggleWishlist, inWishlist, quantityOf } = useCart()

const liked = computed(() => inWishlist(props.product.documentId))
const inCart = computed(() => quantityOf(props.product.documentId))
const soldOut = computed(() => props.product.stock <= 0 || inCart.value >= props.product.stock)
</script>
