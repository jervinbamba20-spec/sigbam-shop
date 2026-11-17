// Shared types + helpers for talking to the Strapi 5 REST API.

export interface StrapiMedia {
  id: number
  documentId: string
  url: string
  name: string
  formats?: Record<string, { url: string }> | null
}

export interface Product {
  id: number
  documentId: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  isActive: boolean
  image: StrapiMedia | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductInput {
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  isActive: boolean
  image?: number | null
}

/** Strapi errors look like { error: { status, name, message, details } } */
export function strapiErrorMessage(err: any, fallback = 'Something went wrong. Please try again.'): string {
  const data = err?.data ?? err?.response?._data
  if (data?.error?.message) return data.error.message
  if (!err?.response) {
    return 'Cannot reach the server. Please check that the Strapi backend is running.'
  }
  return fallback
}

export function useStrapi() {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.strapiUrl).replace(/\/$/, '')

  /** $fetch pre-configured with the Strapi base URL */
  const api = $fetch.create({ baseURL: `${baseURL}/api` })

  /**
   * Local uploads return relative URLs ("/uploads/x.png") while cloud providers
   * (Cloudinary) return absolute URLs, so both are handled here.
   */
  function mediaUrl(media?: StrapiMedia | null, format?: 'small' | 'medium' | 'thumbnail'): string | undefined {
    if (!media) return undefined
    const url = (format && media.formats?.[format]?.url) || media.url
    return url.startsWith('http') ? url : `${baseURL}${url}`
  }

  /** PostgreSQL decimals arrive as strings, so convert them to numbers */
  function normalize(p: any): Product {
    return { ...p, price: Number(p.price) || 0, stock: Number(p.stock) || 0 }
  }

  /** GET /api/products?populate=image (all products, for Product Management) */
  async function fetchProducts(params: Record<string, any> = {}): Promise<Product[]> {
    const res: any = await api('/products', {
      query: {
        populate: 'image',
        sort: 'createdAt:desc',
        'pagination[pageSize]': 200,
        ...params,
      },
    })
    return (res.data || []).map(normalize)
  }

  /** GET /api/products?populate=image&filters[isActive][$eq]=true (homepage) */
  function fetchActiveProducts() {
    return fetchProducts({ 'filters[isActive][$eq]': true })
  }

  async function createProduct(data: ProductInput) {
    const res: any = await api('/products', { method: 'POST', body: { data } })
    return normalize(res.data)
  }

  async function updateProduct(documentId: string, data: Partial<ProductInput>) {
    const res: any = await api(`/products/${documentId}`, { method: 'PUT', body: { data } })
    return normalize(res.data)
  }

  async function deleteProduct(documentId: string) {
    await api(`/products/${documentId}`, { method: 'DELETE' })
  }

  /** POST /api/upload: puts the file in the Strapi Media Library, returns its id */
  async function uploadImage(file: File): Promise<number> {
    const form = new FormData()
    form.append('files', file)
    const res: any = await api('/upload', { method: 'POST', body: form })
    return res[0].id
  }

  /** POST /api/orders/checkout: custom endpoint that validates and deducts stock */
  async function checkout(payload: {
    customerName: string
    contactNumber: string
    deliveryAddress: string
    paymentMethod: string
    items: { documentId: string; quantity: number }[]
  }) {
    return await api<any>('/orders/checkout', { method: 'POST', body: { data: payload } })
  }

  return {
    baseURL,
    mediaUrl,
    fetchProducts,
    fetchActiveProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    checkout,
  }
}
