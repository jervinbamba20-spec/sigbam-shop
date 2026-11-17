<template>
  <v-card class="d-flex flex-column fill-height">
    <!-- Product image (or an icon if there is no image) -->
    <v-img
      v-if="product.image"
      :src="mediaUrl(product.image, 'small')"
      :alt="product.name"
      height="180"
      cover
      class="bg-grey-lighten-4"
    />
    <div v-else class="d-flex align-center justify-center bg-grey-lighten-4" style="height: 180px">
      <v-icon :icon="categoryIcon(product.category)" size="56" color="grey" />
    </div>

    <v-card-text class="flex-grow-1">
      <div class="text-caption text-grey">{{ product.category }}</div>
      <div class="text-subtitle-1 font-weight-bold">{{ product.name }}</div>
      <p class="text-truncate-2 text-grey-darken-1 my-2">
        {{ product.description || 'No description available.' }}
      </p>
      <div class="text-h6 text-primary">{{ formatPrice(product.price) }}</div>
      <div :class="product.stock > 0 ? 'text-grey-darken-1' : 'text-error'">
        {{ product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock' }}
      </div>
      <div v-if="inCart > 0" class="text-caption text-grey">{{ inCart }} in your cart</div>
    </v-card-text>

    <v-card-actions class="px-4 pb-4">
      <v-btn
        color="primary"
        variant="flat"
        class="flex-grow-1"
        :disabled="soldOut"
        @click="addToCart(product)"
      >
        {{ product.stock <= 0 ? 'Out of Stock' : inCart >= product.stock ? 'Max in Cart' : 'Add to Cart' }}
      </v-btn>
      <v-btn
        :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="liked ? 'error' : 'grey'"
        variant="text"
        :aria-label="liked ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="toggleWishlist(product)"
      />
    </v-card-actions>
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
