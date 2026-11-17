<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="bg-grey-lighten-4 border-b">
      <v-container class="py-10 text-center">
        <h1 class="text-h4 font-weight-bold mb-2">Welcome to SigBam Shop</h1>
        <p class="text-body-1 text-grey-darken-1 mb-6">
          Find gadgets, clothes, home items and more at affordable prices.
        </p>
        <v-btn color="primary" variant="flat" size="large" class="mr-2" href="#products">Shop Now</v-btn>
        <v-btn variant="outlined" size="large" to="/products">Manage Products</v-btn>
      </v-container>
    </section>

    <!-- ============ CATEGORIES ============ -->
    <v-container id="categories" class="py-8">
      <h2 class="text-h5 font-weight-bold mb-4">Product Categories</h2>
      <v-row>
        <v-col v-for="c in [ALL, ...categories]" :key="c" cols="6" sm="4" md="3" lg="2">
          <v-card
            class="text-center pa-4"
            :color="selectedCategory === c ? 'primary' : undefined"
            @click="pickCategory(c)"
          >
            <v-icon :icon="c === ALL ? 'mdi-view-grid' : categoryIcon(c)" size="32" />
            <div class="mt-2 text-truncate">{{ c }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ PRODUCTS ============ -->
    <v-container id="products" class="pb-8">
      <h2 class="text-h5 font-weight-bold mb-4">Our Products</h2>

      <!-- Search + category filter -->
      <v-row density="compact">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search by name, description or category"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="selectedCategory" :items="[ALL, ...categories]" label="Category" hide-details />
        </v-col>
      </v-row>
      <p class="text-grey-darken-1 my-4">
        Showing {{ filteredProducts.length }} of {{ products.length }} products
        <v-btn v-if="isFiltering" size="small" variant="text" color="primary" @click="resetFilters">Clear filters</v-btn>
      </p>

      <!-- Error message -->
      <v-alert v-if="error" type="error" variant="outlined" class="mb-4" :text="error">
        <template #append>
          <v-btn variant="text" color="error" @click="load">Retry</v-btn>
        </template>
      </v-alert>

      <!-- Loading -->
      <div v-if="loading && !products.length" class="text-center py-10">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Loading products...</p>
      </div>

      <!-- Product list -->
      <v-row v-else-if="filteredProducts.length">
        <v-col v-for="p in filteredProducts" :key="p.documentId" cols="12" sm="6" md="4" lg="3">
          <ProductCard :product="p" />
        </v-col>
      </v-row>

      <div v-else-if="!error" class="text-center py-10 text-grey-darken-1">
        <v-icon icon="mdi-magnify-close" size="48" color="grey" />
        <p class="mt-2">{{ products.length ? 'No products match your search.' : 'No products yet.' }}</p>
        <v-btn v-if="products.length" variant="text" color="primary" @click="resetFilters">Show all products</v-btn>
      </div>
    </v-container>

    <!-- ============ PROMO ============ -->
    <v-container class="pb-8">
      <v-card class="pa-6 text-center">
        <h2 class="text-h6 font-weight-bold">Year-End Sale: up to 30% off!</h2>
        <p class="text-grey-darken-1 mb-0">
          Use code <strong>SNCBT2026</strong> at checkout. Free delivery on orders over ₱1,500.
        </p>
      </v-card>
    </v-container>

    <!-- ============ NEWSLETTER ============ -->
    <section class="bg-grey-lighten-4 border-t">
      <v-container class="py-8" style="max-width: 640px">
        <h2 class="text-h6 font-weight-bold text-center">Subscribe to our Newsletter</h2>
        <p class="text-grey-darken-1 text-center mb-4">Get updates about new products and promos.</p>
        <v-form ref="newsletterForm" class="d-flex ga-2" @submit.prevent="subscribe">
          <v-text-field
            v-model="email"
            label="Your email address"
            type="email"
            bg-color="white"
            :rules="emailRules"
            density="compact"
          />
          <v-btn type="submit" color="primary" variant="flat" height="40">Subscribe</v-btn>
        </v-form>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
const ALL = 'All Categories'

const { products, loading, error, categories, load } = useProducts()
const notify = useNotify()

const search = ref('')
const selectedCategory = ref(ALL)

// Get the products from Strapi when the page opens
onMounted(load)

// Search (name, description, category) + category filter
const filteredProducts = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return products.value.filter((p) => {
    const matchesCategory = selectedCategory.value === ALL || p.category === selectedCategory.value
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })
})

const isFiltering = computed(() => !!search.value || selectedCategory.value !== ALL)

function pickCategory(c: string) {
  selectedCategory.value = c
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}

function resetFilters() {
  search.value = ''
  selectedCategory.value = ALL
}

// Newsletter (front-end only)
const email = ref('')
const newsletterForm = ref()
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
]
async function subscribe() {
  const { valid } = await newsletterForm.value.validate()
  if (!valid) return
  notify.success(`Thanks for subscribing, ${email.value}!`)
  newsletterForm.value.reset()
}
</script>
