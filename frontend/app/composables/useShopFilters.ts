// Search text and selected category, shared between the header search bar
// and the homepage product grid.
export const ALL_CATEGORIES = 'All Categories'

export function useShopFilters() {
  const search = useState<string>('shop-search', () => '')
  const category = useState<string>('shop-category', () => ALL_CATEGORIES)

  function reset() {
    search.value = ''
    category.value = ALL_CATEGORIES
  }

  return { search, category, reset }
}
