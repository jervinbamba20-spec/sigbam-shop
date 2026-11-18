<template>
  <div>
    <!-- ============ HERO (full-width banner) ============ -->
    <section class="bg-gradient-primary position-relative overflow-hidden">
      <span class="blob" style="width: 520px; height: 520px; top: -180px; right: -120px" />
      <span class="blob" style="width: 300px; height: 300px; bottom: -160px; left: 30%" />
      <div class="page-wrap position-relative py-12 py-md-16">
        <v-row class="align-center">
          <v-col cols="12" md="6">
            <v-chip color="secondary" variant="flat" size="small" prepend-icon="mdi-lightning-bolt" class="mb-4 font-weight-bold">
              Year-End Sale
            </v-chip>
            <h1 class="text-h4 text-md-h2 font-weight-black mb-4" style="line-height: 1.1">
              Everything you need, <span class="text-secondary">in one place</span>
            </h1>
            <p class="text-body-1 text-md-h6 font-weight-regular mb-8" style="opacity: 0.85; max-width: 520px">
              Discover gadgets, fashion, home essentials and more, all at prices you'll love.
            </p>
            <div class="d-flex flex-wrap ga-3">
              <v-btn size="x-large" color="secondary" append-icon="mdi-arrow-right" class="shadow-lg" @click="scrollTo('products')">
                Shop Now
              </v-btn>
              <v-btn size="x-large" variant="outlined" prepend-icon="mdi-view-dashboard-outline" to="/products">
                Manage Products
              </v-btn>
            </div>
          </v-col>
          <!-- Product images from Strapi -->
          <v-col v-if="collage.length" cols="12" md="6" class="d-none d-md-flex justify-end ga-5">
            <v-card
              v-for="(p, i) in collage"
              :key="p.documentId"
              class="shadow-lg"
              width="200"
              :style="{ transform: `translateY(${i === 1 ? -28 : 28}px) rotate(${i === 0 ? -3 : i === 2 ? 3 : 0}deg)` }"
            >
              <v-img :src="mediaUrl(p.image, 'small')" aspect-ratio="0.8" cover />
              <div class="pa-3">
                <div class="text-body-2 font-weight-bold text-truncate">{{ p.name }}</div>
                <div class="text-body-2 text-primary font-weight-bold">{{ formatPrice(p.price) }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- ============ PRODUCT CATEGORIES ============ -->
    <section id="categories" class="page-wrap pt-12 pb-6">
      <div class="text-center mb-8">
        <div class="eyebrow text-primary mb-2">Categories</div>
        <h2 class="section-title">Shop by Category</h2>
      </div>
      <v-row justify="center">
        <v-col v-for="c in [ALL_CATEGORIES, ...categories]" :key="c" cols="6" sm="4" md="3" lg>
          <v-card
            class="category-tile lift text-center pa-5 fill-height"
            :class="category === c ? 'bg-gradient-primary' : ''"
            @click="pickCategory(c)"
          >
            <v-avatar :color="category === c ? 'surface' : 'primary'" variant="tonal" size="64" class="mb-3">
              <v-icon :icon="c === ALL_CATEGORIES ? 'mdi-view-grid-outline' : categoryIcon(c)" size="30" />
            </v-avatar>
            <div class="font-weight-bold text-body-2 text-truncate">{{ c }}</div>
            <div class="text-caption" :style="{ opacity: category === c ? 0.85 : 0.6 }">
              {{ countLabel(c === ALL_CATEGORIES ? products.length : countByCategory[c] || 0) }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <!-- ============ PRODUCT GRID ============ -->
    <section id="products" class="page-wrap py-8">
      <v-card class="pa-4 pa-md-5 mb-6">
        <div class="d-flex flex-wrap align-center ga-4">
          <div>
            <div class="eyebrow text-primary mb-1">Our Products</div>
            <h2 class="section-title">{{ category === ALL_CATEGORIES ? 'All Products' : category }}</h2>
            <div class="text-body-2 text-medium-emphasis">
              {{ countLabel(visibleProducts.length) }}
              <template v-if="search"> for "<strong>{{ search }}</strong>"</template>
            </div>
          </div>
          <v-spacer />
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
        </div>

        <!-- Search for phones (the header search is hidden on small screens) -->
        <v-text-field
          v-if="mobile"
          v-model="search"
          placeholder="Search products, categories..."
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="mt-4"
        />

        <!-- Category filter -->
        <v-chip-group v-model="category" mandatory selected-class="bg-primary" class="mt-3">
          <v-chip v-for="c in [ALL_CATEGORIES, ...categories]" :key="c" :value="c" variant="tonal" filter>
            {{ c }}
          </v-chip>
        </v-chip-group>
      </v-card>

      <!-- Error -->
      <v-alert v-if="error" type="error" variant="tonal" rounded="xl" class="mb-6" :text="error">
        <template #append>
          <v-btn variant="outlined" color="error" @click="load">Retry</v-btn>
        </template>
      </v-alert>

      <!-- Loading -->
      <div v-if="loading && !products.length" class="product-grid">
        <v-skeleton-loader v-for="n in 8" :key="n" type="image, article, button" class="rounded-xl" />
      </div>

      <!-- Grid -->
      <div v-else-if="visibleProducts.length" class="product-grid">
        <ProductCard v-for="p in visibleProducts" :key="p.documentId" :product="p" />
      </div>

      <!-- Empty -->
      <v-card v-else-if="!error" class="pa-12 text-center">
        <v-avatar color="primary" variant="tonal" size="80" class="mb-4">
          <v-icon icon="mdi-magnify-close" size="40" />
        </v-avatar>
        <div class="text-h6 font-weight-bold">
          {{ products.length ? 'No products match your search' : 'No products yet' }}
        </div>
        <p class="text-medium-emphasis mb-5">
          {{ products.length ? 'Try another keyword or category.' : 'Add products in Product Management to see them here.' }}
        </p>
        <v-btn v-if="products.length" color="primary" @click="reset">Show all products</v-btn>
        <v-btn v-else color="primary" to="/products">Manage Products</v-btn>
      </v-card>
    </section>

    <!-- ============ PROMOTIONAL CONTENT ============ -->
    <section class="page-wrap py-8">
      <v-card class="bg-gradient-secondary pa-8 pa-md-10 position-relative overflow-hidden">
        <v-icon icon="mdi-tag-heart" size="220" class="bg-icon" />
        <div class="position-relative">
          <div class="eyebrow mb-2" style="opacity: 0.9">Limited time offer</div>
          <h3 class="text-h5 text-md-h4 font-weight-black mb-2">Year-End Sale is on!</h3>
          <p class="mb-6" style="opacity: 0.9; max-width: 520px">
            New products every week and limited stock on our best sellers. Grab your favorites before they're gone.
          </p>
          <v-btn color="surface" class="text-secondary" size="large" append-icon="mdi-arrow-right" @click="scrollTo('products')">
            Start Shopping
          </v-btn>
        </div>
      </v-card>
    </section>

    <!-- ============ NEWSLETTER ============ -->
    <section class="page-wrap pt-8 pb-14">
      <v-card class="bg-gradient-primary shadow-lg pa-8 pa-md-12 position-relative overflow-hidden">
        <span class="blob" style="width: 360px; height: 360px; top: -160px; right: -80px" />
        <v-row class="align-center position-relative">
          <v-col cols="12" md="6">
            <div class="eyebrow mb-2" style="opacity: 0.8">Newsletter</div>
            <h2 class="text-h5 text-md-h4 font-weight-black mb-2">Get the best deals in your inbox</h2>
            <p class="mb-0" style="opacity: 0.85">New arrivals, promos and restock alerts. No spam.</p>
          </v-col>
          <v-col cols="12" md="6">
            <v-form ref="newsletterForm" class="d-flex flex-column flex-sm-row ga-3" @submit.prevent="subscribe">
              <v-text-field
                v-model="email"
                placeholder="Enter your email address"
                type="email"
                bg-color="surface"
                variant="solo"
                flat
                prepend-inner-icon="mdi-email-outline"
                :rules="emailRules"
                class="flex-grow-1"
              />
              <v-btn type="submit" color="secondary" size="x-large" height="56" class="shadow-lg">Subscribe</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Product } from '~/composables/useStrapi'

const { smAndDown: mobile } = useDisplay()
const { products, loading, error, categories, load } = useProducts()
const { search, category, reset } = useShopFilters()
const { mediaUrl } = useStrapi()
const notify = useNotify()

// Always fetch fresh products from Strapi when the homepage opens
onMounted(load)

// Three product photos for the hero banner
const collage = computed(() => products.value.filter((p) => p.image && p.stock > 0).slice(0, 3))

const countByCategory = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of products.value) counts[p.category] = (counts[p.category] || 0) + 1
  return counts
})

const countLabel = (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`

/** Search (name, description, category) + category filter */
const visibleProducts = computed<Product[]>(() => {
  const q = (search.value || '').trim().toLowerCase()
  return products.value.filter((p) => {
    const matchesCategory = category.value === ALL_CATEGORIES || p.category === category.value
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })
})

// If the selected category disappears after a refresh, go back to All Categories
watch(categories, (list) => {
  if (category.value !== ALL_CATEGORIES && !list.includes(category.value)) category.value = ALL_CATEGORIES
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function pickCategory(c: string) {
  category.value = c
  scrollTo('products')
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

<style scoped>
/* Responsive product grid: as many columns as fit (2 on phones, up to 5 on wide screens) */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
@media (min-width: 600px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 28px;
  }
}
</style>
