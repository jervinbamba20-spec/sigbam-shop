<template>
  <div class="page-wrap py-8">
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" to="/" aria-label="Back to store" />
      <h1 class="text-h5 text-md-h4 font-weight-bold ml-2">Checkout All</h1>
    </div>

    <v-empty-state
      v-if="items.length === 0"
      icon="mdi-cart-outline"
      title="Your cart is empty"
      text="Add products to your cart before checking out."
    >
      <template #actions>
        <v-btn color="primary" to="/" prepend-icon="mdi-shopping">Continue Shopping</v-btn>
      </template>
    </v-empty-state>

    <v-row v-else>
      <!-- ============ ORDER SUMMARY ============ -->
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-receipt-text" class="mr-2" color="primary" /> Order Summary
            <v-spacer />
            <v-btn size="small" variant="text" prepend-icon="mdi-refresh" :loading="loadingProducts" @click="refresh">
              Refresh stock
            </v-btn>
          </v-card-title>
          <v-divider />

          <v-alert
            v-if="hasProblems"
            type="warning"
            variant="tonal"
            class="ma-4"
            text="Some items are unavailable or exceed the available stock. Please fix them before checking out."
          />

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right d-none d-sm-table-cell">Price</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.documentId">
                <td class="py-2">
                  <div class="d-flex align-center">
                    <v-avatar size="48" color="background" class="mr-3 d-none d-sm-flex">
                      <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
                      <v-icon v-else :icon="categoryIcon(item.category)" color="primary" />
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-medium-emphasis d-sm-none">{{ formatPrice(item.price) }}</div>
                      <div v-if="item.unavailable" class="text-caption text-error">No longer available</div>
                      <div v-else-if="item.stock <= 0" class="text-caption text-error">Out of stock</div>
                      <div v-else class="text-caption text-medium-emphasis">{{ item.stock }} in stock</div>
                    </div>
                  </div>
                </td>
                <td class="text-right d-none d-sm-table-cell">{{ formatPrice(item.price) }}</td>
                <td class="text-center">
                  <div class="d-inline-flex align-center">
                    <v-btn icon="mdi-minus" size="x-small" variant="text" :disabled="item.quantity <= 1 || item.unavailable" aria-label="Decrease" @click="decrement(item.documentId)" />
                    <span class="mx-1 font-weight-medium">{{ item.quantity }}</span>
                    <v-btn icon="mdi-plus" size="x-small" variant="text" :disabled="item.quantity >= item.stock || item.unavailable" aria-label="Increase" @click="increment(item.documentId)" />
                  </div>
                </td>
                <td class="text-right font-weight-medium">{{ formatPrice(subtotal(item)) }}</td>
                <td class="text-right">
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error" aria-label="Remove" @click="removeFromCart(item.documentId)" />
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider />
          <div class="pa-4">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-medium-emphasis">Total items</span>
              <span class="font-weight-medium">{{ totalItems }}</span>
            </div>
            <v-divider class="my-2" />
            <div class="d-flex justify-space-between text-h6">
              <span>Total amount</span>
              <span class="text-primary font-weight-bold">{{ formatPrice(totalAmount) }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ============ CUSTOMER FORM ============ -->
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-account-box" class="mr-2" color="primary" /> Customer Information
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="submit">
              <v-text-field
                v-model.trim="form.customerName"
                label="Full Name *"
                prepend-inner-icon="mdi-account"
                :rules="[required('Full name'), (v: string) => (v && v.length >= 3) || 'Enter at least 3 characters']"
                maxlength="100"
                class="mb-2"
              />
              <v-text-field
                v-model.trim="form.contactNumber"
                label="Contact Number *"
                prepend-inner-icon="mdi-phone"
                placeholder="09171234567"
                hint="Format: 09XXXXXXXXX or +639XXXXXXXXX"
                :rules="[required('Contact number'), phoneRule]"
                inputmode="tel"
                maxlength="16"
                class="mb-2"
              />
              <v-textarea
                v-model.trim="form.deliveryAddress"
                label="Delivery Address *"
                prepend-inner-icon="mdi-map-marker"
                rows="3"
                auto-grow
                :rules="[required('Delivery address'), (v: string) => (v && v.length >= 10) || 'Please enter a complete address']"
                maxlength="300"
                class="mb-2"
              />

              <div class="text-subtitle-2 mb-1">Payment Method *</div>
              <v-radio-group v-model="form.paymentMethod" :rules="[required('Payment method')]" class="mt-0">
                <v-radio v-for="m in paymentMethods" :key="m.value" :value="m.value">
                  <template #label>
                    <v-icon :icon="m.icon" class="mr-2" size="small" /> {{ m.value }}
                  </template>
                </v-radio>
              </v-radio-group>

              <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
                {{ errorMessage }}
              </v-alert>

              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                prepend-icon="mdi-check-circle"
                :loading="submitting"
                :disabled="totalItems === 0"
              >
                Place Order · {{ formatPrice(totalAmount) }}
              </v-btn>
              <v-btn block variant="text" class="mt-2" to="/">Continue Shopping</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ============ SUCCESS DIALOG ============ -->
    <v-dialog v-model="successOpen" max-width="480" persistent>
      <v-card class="text-center pa-4">
        <v-icon icon="mdi-check-circle" color="success" size="72" class="mx-auto mt-2" />
        <v-card-title class="text-h5">Order placed!</v-card-title>
        <v-card-text v-if="lastOrder">
          <p class="mb-2">Thank you, <strong>{{ lastOrder.customerName }}</strong>. Your order has been received.</p>
          <p class="text-body-2 text-medium-emphasis mb-1">Order #: <strong>{{ lastOrder.orderNumber }}</strong></p>
          <p class="text-body-2 text-medium-emphasis mb-1">
            {{ lastOrder.totalItems }} item(s) · <strong>{{ formatPrice(lastOrder.totalAmount) }}</strong>
          </p>
          <p class="text-body-2 text-medium-emphasis">Payment: {{ lastOrder.paymentMethod }}</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="flat" @click="finish">Continue Shopping</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const {
  items, totalItems, totalAmount, hasProblems, subtotal,
  increment, decrement, removeFromCart, clearCart,
} = useCart()
const { load: loadProducts, loading: loadingProducts, error: productsError } = useProducts()
const { checkout } = useStrapi()
const notify = useNotify()

const paymentMethods = [
  { value: 'Cash on Delivery', icon: 'mdi-cash' },
  { value: 'GCash', icon: 'mdi-cellphone' },
  { value: 'Credit/Debit Card', icon: 'mdi-credit-card' },
  { value: 'Bank Transfer', icon: 'mdi-bank' },
]

const formRef = ref()
const form = reactive({
  customerName: '',
  contactNumber: '',
  deliveryAddress: '',
  paymentMethod: '',
})
const submitting = ref(false)
const errorMessage = ref('')
const successOpen = ref(false)
const lastOrder = ref<any>(null)

const required = (field: string) => (v: string) => !!(v && String(v).trim()) || `${field} is required`
const phoneRule = (v: string) =>
  /^(09\d{9}|\+639\d{9})$/.test((v || '').replace(/[\s-]/g, '')) || 'Enter a valid PH mobile number'

// Get the latest prices and stock from Strapi when the page opens
onMounted(refresh)

async function refresh() {
  await loadProducts()
  if (productsError.value) notify.error(productsError.value)
}

async function submit() {
  errorMessage.value = ''
  const { valid } = await formRef.value.validate()
  if (!valid) {
    notify.warning('Please complete all required fields.')
    return
  }

  // Re-check stock with the latest data before sending the order
  await loadProducts()
  if (productsError.value) {
    errorMessage.value = productsError.value
    return
  }
  if (hasProblems.value) {
    errorMessage.value = 'Some cart items are unavailable or exceed stock. Please review your cart.'
    return
  }

  submitting.value = true
  try {
    const res = await checkout({
      customerName: form.customerName,
      contactNumber: form.contactNumber.replace(/[\s-]/g, ''),
      deliveryAddress: form.deliveryAddress,
      paymentMethod: form.paymentMethod,
      items: items.value.map((i) => ({ documentId: i.documentId, quantity: i.quantity })),
    })
    // Success: clear the cart ONLY now, then refresh products to show new stock
    lastOrder.value = res.data
    clearCart()
    formRef.value.reset()
    await loadProducts()
    successOpen.value = true
    notify.success('Checkout successful! Stock has been updated.')
  } catch (err) {
    // Failure: keep the cart, show the reason, refresh stock so the user can fix it
    errorMessage.value = strapiErrorMessage(err, 'Checkout failed. Please try again.')
    notify.error(errorMessage.value)
    await loadProducts()
  } finally {
    submitting.value = false
  }
}

function finish() {
  successOpen.value = false
  navigateTo('/')
}
</script>
