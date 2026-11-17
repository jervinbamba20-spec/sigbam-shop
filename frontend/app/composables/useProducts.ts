import type { Product } from './useStrapi'

// Active products shown in the store. Shared by the homepage, wishlist,
// cart and checkout so everything uses the same, freshest data.
export function useProducts() {
  const products = useState<Product[]>('active-products', () => [])
  const loading = useState<boolean>('active-products-loading', () => false)
  const error = useState<string | null>('active-products-error', () => null)
  const loaded = useState<boolean>('active-products-loaded', () => false)
  const { fetchActiveProducts } = useStrapi()
  const { syncWithProducts } = useCart()

  async function load() {
    loading.value = true
    error.value = null
    try {
      products.value = await fetchActiveProducts()
      syncWithProducts(products.value)
      loaded.value = true
    } catch (err) {
      error.value = strapiErrorMessage(err, 'Failed to load products.')
    } finally {
      loading.value = false
    }
  }

  /** Load once; later calls reuse what is already loaded */
  async function ensureLoaded() {
    if (!loaded.value && !loading.value) await load()
  }

  /** Category names found in the active products, sorted A–Z */
  const categories = computed(() =>
    [...new Set(products.value.map((p) => p.category).filter(Boolean))].sort(),
  )

  return { products, loading, error, loaded, categories, load, ensureLoaded }
}

/** Icon used for a category card / image placeholder */
export function categoryIcon(category?: string) {
  const c = (category || '').toLowerCase()
  if (c.includes('electr') || c.includes('gadget')) return 'mdi-laptop'
  if (c.includes('fashion') || c.includes('cloth') || c.includes('apparel')) return 'mdi-tshirt-crew'
  if (c.includes('home') || c.includes('kitchen') || c.includes('living')) return 'mdi-sofa'
  if (c.includes('beauty') || c.includes('health')) return 'mdi-lipstick'
  if (c.includes('sport') || c.includes('fitness')) return 'mdi-basketball'
  if (c.includes('book')) return 'mdi-book-open-page-variant'
  if (c.includes('toy') || c.includes('game')) return 'mdi-gamepad-variant'
  if (c.includes('food') || c.includes('grocer')) return 'mdi-food-apple'
  return 'mdi-tag'
}
