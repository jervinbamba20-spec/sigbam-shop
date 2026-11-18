<template>
  <div class="page-wrap py-8">
    <!-- ============ HEADER ============ -->
    <div class="d-flex flex-wrap align-center ga-3 mb-6">
      <div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">Product Management</h1>
        <p class="text-medium-emphasis">Create, view, update and delete products stored in Strapi.</p>
      </div>
      <v-spacer />
      <v-btn variant="outlined" color="primary" prepend-icon="mdi-storefront" to="/">Go to Homepage</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Product</v-btn>
    </div>

    <!-- ============ TABLE ============ -->
    <v-card>
      <v-card-text>
        <v-row density="compact">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search products (name, description, category)"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="6" md="3">
            <v-select v-model="statusFilter" :items="['All', 'Active', 'Inactive']" label="Status" hide-details />
          </v-col>
          <v-col cols="6" md="3" class="d-flex align-center">
            <v-btn block variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-alert v-if="loadError" type="error" variant="tonal" class="mx-4 mb-4" :text="loadError">
        <template #append><v-btn variant="outlined" color="error" @click="load">Retry</v-btn></template>
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="tableItems"
        :search="search"
        :custom-filter="filterProducts"
        :loading="loading"
        item-value="documentId"
        :items-per-page="10"
        hover
        mobile-breakpoint="sm"
      >
        <template #item.image="{ item }">
          <v-avatar size="52" color="background" class="my-2">
            <v-img v-if="item.image" :src="mediaUrl(item.image, 'thumbnail')" cover />
            <v-icon v-else icon="mdi-image-off-outline" color="primary" />
          </v-avatar>
        </template>
        <template #item.name="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
          <div class="text-caption text-medium-emphasis text-truncate" style="max-width: 260px">
            {{ item.description }}
          </div>
        </template>
        <template #item.category="{ item }">
          <v-chip size="small" variant="tonal" color="primary">{{ item.category }}</v-chip>
        </template>
        <template #item.price="{ item }">{{ formatPrice(item.price) }}</template>
        <template #item.stock="{ item }">
          <v-chip size="small" :color="item.stock <= 5 ? 'secondary' : 'primary'" :variant="item.stock <= 0 ? 'flat' : 'tonal'">
            {{ item.stock }}
          </v-chip>
        </template>
        <template #item.isActive="{ item }">
          <v-chip size="small" color="primary" :variant="item.isActive ? 'flat' : 'outlined'">
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn icon="mdi-eye" size="small" variant="text" aria-label="View" @click="openView(item)" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" aria-label="Edit" @click="openEdit(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" aria-label="Delete" @click="askDelete(item)" />
          </div>
        </template>
        <template #no-data>
          <div class="py-8 text-medium-emphasis">
            No products found. Click <strong>Add Product</strong> to create one.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ============ CREATE / EDIT DIALOG ============ -->
    <v-dialog v-model="formOpen" max-width="720" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon :icon="editing ? 'mdi-pencil' : 'mdi-plus-box'" class="mr-2" color="primary" />
          {{ editing ? 'Edit Product' : 'Add Product' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" :disabled="saving" @click="formOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="save">
            <v-row density="compact">
              <v-col cols="12">
                <v-text-field
                  v-model.trim="form.name"
                  label="Product Name *"
                  :rules="[required('Product name')]"
                  maxlength="120"
                  counter
                />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.description" label="Description" rows="3" auto-grow maxlength="1000" counter />
              </v-col>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="form.category"
                  :items="categoryOptions"
                  label="Category *"
                  hint="Pick one or type a new category"
                  persistent-hint
                  :rules="[required('Category')]"
                />
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-switch
                  v-model="form.isActive"
                  color="primary"
                  :label="form.isActive ? 'Active (visible in store)' : 'Inactive (hidden from store)'"
                  hide-details
                  inset
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.price"
                  label="Price (₱) *"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="₱"
                  :rules="[requiredNumber('Price'), (v: number) => v >= 0 || 'Price cannot be negative']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.stock"
                  label="Stock *"
                  type="number"
                  min="0"
                  step="1"
                  :rules="[requiredNumber('Stock'), (v: number) => (Number.isInteger(Number(v)) && v >= 0) || 'Stock must be a whole number ≥ 0']"
                />
              </v-col>
              <v-col cols="12" sm="8">
                <v-file-input
                  v-model="imageFile"
                  label="Product Image"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  prepend-icon=""
                  prepend-inner-icon="mdi-camera"
                  show-size
                  clearable
                  :rules="[imageRule]"
                  :hint="editing && currentImage ? 'Leave empty to keep the current image' : 'JPG, PNG, WEBP or GIF up to 5 MB'"
                  persistent-hint
                />
                <v-checkbox
                  v-if="editing && currentImage && !pickedFile"
                  v-model="removeImage"
                  label="Remove current image"
                  density="compact"
                  hide-details
                  color="error"
                />
              </v-col>
              <v-col cols="12" sm="4" class="d-flex justify-center">
                <v-avatar size="120" color="background">
                  <v-img v-if="previewUrl" :src="previewUrl" cover />
                  <v-icon v-else icon="mdi-image-outline" size="48" color="primary" />
                </v-avatar>
              </v-col>
            </v-row>
            <v-alert v-if="formError" type="error" variant="tonal" class="mt-3" :text="formError" />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="saving" @click="formOpen = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" prepend-icon="mdi-content-save" @click="save">
            {{ editing ? 'Save Changes' : 'Create Product' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============ VIEW DIALOG ============ -->
    <v-dialog v-model="viewOpen" max-width="640">
      <v-card v-if="viewing">
        <v-img v-if="viewing.image" :src="mediaUrl(viewing.image)" max-height="320" cover class="bg-background" />
        <div v-else class="d-flex align-center justify-center bg-background" style="height: 180px">
          <v-icon icon="mdi-image-off-outline" size="64" color="primary" />
        </div>
        <v-card-title class="text-h5 pt-4">{{ viewing.name }}</v-card-title>
        <v-card-subtitle>
          <v-chip size="small" color="primary" variant="tonal" class="mr-2">{{ viewing.category }}</v-chip>
          <v-chip size="small" color="primary" :variant="viewing.isActive ? 'flat' : 'outlined'">{{ viewing.isActive ? 'Active' : 'Inactive' }}</v-chip>
        </v-card-subtitle>
        <v-card-text>
          <p class="mb-4">{{ viewing.description || 'No description.' }}</p>
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-cash" title="Price" :subtitle="formatPrice(viewing.price)" />
            <v-list-item prepend-icon="mdi-package-variant" title="Stock" :subtitle="`${viewing.stock} unit(s)`" />
            <v-list-item prepend-icon="mdi-identifier" title="Document ID" :subtitle="viewing.documentId" />
            <v-list-item
              prepend-icon="mdi-clock-outline"
              title="Last updated"
              :subtitle="viewing.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : '-'"
            />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="viewOpen = false">Close</v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil" @click="viewOpen = false; openEdit(viewing)">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============ DELETE DIALOG ============ -->
    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card v-if="deleting">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-alert" color="error" class="mr-2" /> Delete product?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ deleting.name }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="removing" @click="deleteOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="removing" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductInput } from '~/composables/useStrapi'

const { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, mediaUrl } = useStrapi()
const notify = useNotify()
const { load: reloadStore } = useProducts()

const DEFAULT_CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books']

// ---------- list / read ----------
const products = ref<Product[]>([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')
const statusFilter = ref('All')

const headers = [
  { title: 'Image', key: 'image', sortable: false, width: 80 },
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price', align: 'end' as const },
  { title: 'Stock', key: 'stock', align: 'center' as const },
  { title: 'Status', key: 'isActive', align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    products.value = await fetchProducts()
  } catch (err) {
    loadError.value = strapiErrorMessage(err, 'Failed to load products.')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const tableItems = computed(() =>
  products.value.filter((p) =>
    statusFilter.value === 'All' ? true : statusFilter.value === 'Active' ? p.isActive : !p.isActive,
  ),
)

/** Search by name, description and category */
function filterProducts(_value: unknown, query: string, item: any) {
  const p: Product = item.raw
  const q = query.toLowerCase()
  return [p.name, p.description, p.category].some((f) => (f || '').toLowerCase().includes(q))
}


const categoryOptions = computed(() =>
  [...new Set([...DEFAULT_CATEGORIES, ...products.value.map((p) => p.category).filter(Boolean)])].sort(),
)

// ---------- create / update ----------
const formOpen = ref(false)
const formRef = ref()
const editing = ref<Product | null>(null)
const saving = ref(false)
const formError = ref('')
const emptyForm = () => ({ name: '', description: '', category: '', price: null as number | null, stock: null as number | null, isActive: true })
const form = reactive(emptyForm())
const imageFile = ref<File | File[] | null>(null)
const removeImage = ref(false)
const currentImage = ref<Product['image']>(null)

const pickedFile = computed<File | null>(() => {
  const f = imageFile.value
  return Array.isArray(f) ? f[0] ?? null : f
})

const localPreview = ref<string | null>(null)
watch(pickedFile, (file) => {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = file ? URL.createObjectURL(file) : null
})
const previewUrl = computed(() => {
  if (localPreview.value) return localPreview.value
  if (currentImage.value && !removeImage.value) return mediaUrl(currentImage.value, 'thumbnail')
  return null
})

const required = (field: string) => (v: any) => !!(v && String(v).trim()) || `${field} is required`
const requiredNumber = (field: string) => (v: any) => (v !== null && v !== '' && !Number.isNaN(Number(v))) || `${field} is required`
const imageRule = (v: any) => {
  const f = Array.isArray(v) ? v[0] : v
  if (!f) return true
  if (!f.type?.startsWith('image/')) return 'File must be an image'
  return f.size <= 5 * 1024 * 1024 || 'Image must be 5 MB or less'
}

function resetForm() {
  Object.assign(form, emptyForm())
  imageFile.value = null
  removeImage.value = false
  currentImage.value = null
  formError.value = ''
}

function openCreate() {
  editing.value = null
  resetForm()
  formOpen.value = true
}

function openEdit(p: Product) {
  editing.value = p
  resetForm()
  Object.assign(form, {
    name: p.name,
    description: p.description || '',
    category: p.category,
    price: p.price,
    stock: p.stock,
    isActive: p.isActive,
  })
  currentImage.value = p.image
  formOpen.value = true
}

async function save() {
  formError.value = ''
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const data: ProductInput = {
      name: form.name,
      description: form.description || null,
      category: String(form.category).trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    }
    // Step 1: upload the image (if any) to get its media id
    if (pickedFile.value) data.image = await uploadImage(pickedFile.value)
    else if (editing.value && removeImage.value) data.image = null

    // Step 2: create or update the product with that image id
    if (editing.value) {
      await updateProduct(editing.value.documentId, data)
      notify.success(`"${data.name}" updated successfully.`)
    } else {
      await createProduct(data)
      notify.success(`"${data.name}" created successfully.`)
    }
    formOpen.value = false
    await load()
    reloadStore() // keep the storefront in sync
  } catch (err) {
    formError.value = strapiErrorMessage(err, 'Failed to save product.')
  } finally {
    saving.value = false
  }
}

// ---------- view ----------
const viewOpen = ref(false)
const viewing = ref<Product | null>(null)
function openView(p: Product) {
  viewing.value = p
  viewOpen.value = true
}

// ---------- delete ----------
const deleteOpen = ref(false)
const deleting = ref<Product | null>(null)
const removing = ref(false)
function askDelete(p: Product) {
  deleting.value = p
  deleteOpen.value = true
}
async function confirmDelete() {
  if (!deleting.value) return
  removing.value = true
  try {
    await deleteProduct(deleting.value.documentId)
    notify.success(`"${deleting.value.name}" deleted.`)
    deleteOpen.value = false
    await load()
    reloadStore()
  } catch (err) {
    notify.error(strapiErrorMessage(err, 'Failed to delete product.'))
  } finally {
    removing.value = false
  }
}
</script>
