import type { Product } from './useStrapi'

// Cart + wishlist state shared across all pages (useState) and saved to
// localStorage so they survive a page refresh.

export interface CartItem {
  documentId: string
  name: string
  category: string
  price: number
  stock: number // latest known stock from Strapi
  imageUrl?: string
  quantity: number
  unavailable?: boolean // product became inactive / was deleted
}

const CART_KEY = 'sigbam-shop-cart'
const WISHLIST_KEY = 'sigbam-shop-wishlist'

function load<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be unavailable (private mode) — the cart still works in memory */
  }
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => load(CART_KEY, []))
  const wishlist = useState<string[]>('wishlist', () => load(WISHLIST_KEY, []))
  const drawer = useState<boolean>('cart-drawer', () => false)
  const { mediaUrl } = useStrapi()
  const notify = useNotify()

  // Persist every change (registered once per app via a flag)
  const watching = useState('cart-watching', () => false)
  if (import.meta.client && !watching.value) {
    watching.value = true
    watch(items, (v) => save(CART_KEY, v), { deep: true })
    watch(wishlist, (v) => save(WISHLIST_KEY, v), { deep: true })
  }

  // ---------- computed totals ----------
  const availableItems = computed(() => items.value.filter((i) => !i.unavailable))
  /** Number of units in the cart (shown on the cart badge) */
  const totalItems = computed(() => availableItems.value.reduce((sum, i) => sum + i.quantity, 0))
  /** Sum of every line subtotal (price × quantity) */
  const totalAmount = computed(() =>
    round2(availableItems.value.reduce((sum, i) => sum + subtotal(i), 0)),
  )
  const hasProblems = computed(() =>
    items.value.some((i) => i.unavailable || i.stock <= 0 || i.quantity > i.stock),
  )

  function subtotal(item: CartItem) {
    return round2(item.price * item.quantity)
  }

  function quantityOf(documentId: string) {
    return items.value.find((i) => i.documentId === documentId)?.quantity ?? 0
  }

  // ---------- cart actions ----------
  function addToCart(product: Product, qty = 1): boolean {
    if (!product.isActive) {
      notify.warning(`${product.name} is not available.`)
      return false
    }
    if (product.stock <= 0) {
      notify.warning(`${product.name} is out of stock.`)
      return false
    }
    const existing = items.value.find((i) => i.documentId === product.documentId)
    const current = existing?.quantity ?? 0
    if (current + qty > product.stock) {
      notify.warning(`Only ${product.stock} ${product.name} in stock. You already have ${current} in your cart.`)
      return false
    }
    if (existing) {
      existing.quantity += qty
      Object.assign(existing, snapshot(product), { unavailable: false })
    } else {
      items.value.push({ ...snapshot(product), quantity: qty })
    }
    notify.success(`${product.name} added to cart.`)
    return true
  }

  function setQuantity(documentId: string, qty: number) {
    const item = items.value.find((i) => i.documentId === documentId)
    if (!item) return
    const q = Math.floor(Number(qty))
    if (!Number.isFinite(q) || q < 1) {
      item.quantity = 1
      return
    }
    if (q > item.stock) {
      item.quantity = Math.max(1, item.stock)
      notify.warning(`Only ${item.stock} ${item.name} available in stock.`)
      return
    }
    item.quantity = q
  }

  function increment(documentId: string) {
    const item = items.value.find((i) => i.documentId === documentId)
    if (item) setQuantity(documentId, item.quantity + 1)
  }

  function decrement(documentId: string) {
    const item = items.value.find((i) => i.documentId === documentId)
    if (item && item.quantity > 1) item.quantity -= 1
  }

  function removeFromCart(documentId: string) {
    const item = items.value.find((i) => i.documentId === documentId)
    items.value = items.value.filter((i) => i.documentId !== documentId)
    if (item) notify.info(`${item.name} removed from cart.`)
  }

  function clearCart() {
    items.value = []
  }

  /**
   * Called after products are (re)loaded from Strapi: refreshes prices/stock,
   * flags items that are no longer active, and caps quantities at the stock.
   */
  function syncWithProducts(products: Product[]) {
    const byId = new Map(products.map((p) => [p.documentId, p]))
    for (const item of items.value) {
      const p = byId.get(item.documentId)
      if (!p || !p.isActive) {
        item.unavailable = true
        continue
      }
      Object.assign(item, snapshot(p), { unavailable: false })
      if (item.stock > 0 && item.quantity > item.stock) item.quantity = item.stock
    }
  }

  function snapshot(p: Product) {
    return {
      documentId: p.documentId,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      imageUrl: mediaUrl(p.image, 'thumbnail'),
    }
  }

  // ---------- wishlist ----------
  function inWishlist(documentId: string) {
    return wishlist.value.includes(documentId)
  }

  function toggleWishlist(product: Product) {
    if (inWishlist(product.documentId)) {
      wishlist.value = wishlist.value.filter((id) => id !== product.documentId)
      notify.info(`${product.name} removed from wishlist.`)
    } else {
      wishlist.value = [...wishlist.value, product.documentId]
      notify.success(`${product.name} added to wishlist.`)
    }
  }

  return {
    items,
    wishlist,
    drawer,
    availableItems,
    totalItems,
    totalAmount,
    hasProblems,
    subtotal,
    quantityOf,
    addToCart,
    setQuantity,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    syncWithProducts,
    inWishlist,
    toggleWishlist,
  }
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

/** Philippine peso formatting, e.g. ₱1,299.00 */
export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(n) || 0)
}
