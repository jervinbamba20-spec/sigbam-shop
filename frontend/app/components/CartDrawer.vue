<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    :width="mobile ? 340 : 420"
  >
    <div class="d-flex flex-column fill-height">
      <div class="d-flex align-center pa-4">
        <v-icon icon="mdi-cart" color="primary" class="mr-2" />
        <span class="text-h6">Shopping Cart</span>
        <v-chip class="ml-2" size="small" color="primary" variant="tonal">{{ totalItems }} item(s)</v-chip>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Close cart" @click="drawer = false" />
      </div>
      <v-divider />

      <div class="flex-grow-1 overflow-y-auto">
        <v-empty-state
          v-if="items.length === 0"
          icon="mdi-cart-outline"
          title="Your cart is empty"
          text="Browse the store and add products to your cart."
        />

        <v-list v-else lines="three" class="py-0">
          <template v-for="item in items" :key="item.documentId">
            <v-list-item class="py-3">
              <template #prepend>
                <v-avatar size="64" color="background" class="mr-1">
                  <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
                  <v-icon v-else :icon="categoryIcon(item.category)" color="primary" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatPrice(item.price) }} each · {{ item.stock }} in stock
              </v-list-item-subtitle>

              <v-alert
                v-if="item.unavailable"
                type="error"
                density="compact"
                variant="tonal"
                class="mt-2"
                text="This product is no longer available. Please remove it."
              />
              <v-alert
                v-else-if="item.stock <= 0"
                type="warning"
                density="compact"
                variant="tonal"
                class="mt-2"
                text="Out of stock. Please remove it."
              />

              <div class="d-flex align-center mt-2">
                <v-btn
                  icon="mdi-minus"
                  size="x-small"
                  variant="tonal"
                  :disabled="item.quantity <= 1 || item.unavailable"
                  aria-label="Decrease quantity"
                  @click="decrement(item.documentId)"
                />
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :max="item.stock"
                  class="qty-input mx-2"
                  aria-label="Quantity"
                  :disabled="item.unavailable"
                  @change="setQuantity(item.documentId, Number(($event.target as HTMLInputElement).value)); ($event.target as HTMLInputElement).value = String(item.quantity)"
                >
                <v-btn
                  icon="mdi-plus"
                  size="x-small"
                  variant="tonal"
                  :disabled="item.quantity >= item.stock || item.unavailable"
                  aria-label="Increase quantity"
                  @click="increment(item.documentId)"
                />
                <v-spacer />
                <span class="font-weight-bold mr-2">{{ formatPrice(subtotal(item)) }}</span>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  aria-label="Remove item"
                  @click="removeFromCart(item.documentId)"
                />
              </div>
            </v-list-item>
            <v-divider />
          </template>
        </v-list>
      </div>

      <div v-if="items.length" class="pa-4 bg-background">
        <div class="d-flex justify-space-between mb-1">
          <span>Total items</span>
          <span class="font-weight-medium">{{ totalItems }}</span>
        </div>
        <div class="d-flex justify-space-between text-h6 mb-3">
          <span>Total amount</span>
          <span class="text-primary font-weight-bold">{{ formatPrice(totalAmount) }}</span>
        </div>
        <v-btn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-cash-register"
          :disabled="totalItems === 0"
          @click="goToCheckout"
        >
          Checkout All
        </v-btn>
        <v-btn block variant="text" color="error" class="mt-2" @click="confirmClear = true">
          Clear cart
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="confirmClear" max-width="360">
      <v-card title="Clear cart?" text="All items will be removed from your cart.">
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmClear = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="clearCart(); confirmClear = false">Clear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { xs: mobile } = useDisplay()
const {
  items, drawer, totalItems, totalAmount, subtotal,
  increment, decrement, setQuantity, removeFromCart, clearCart,
} = useCart()
const confirmClear = ref(false)

function goToCheckout() {
  drawer.value = false
  navigateTo('/checkout')
}
</script>

<style scoped>
.qty-input {
  width: 56px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 4px;
}
</style>
