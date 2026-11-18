import { createVuetify } from 'vuetify'
import 'vuetify/styles'

// Only 3 brand colors are used in the whole app:
const PRIMARY = '#3949AB' // indigo: header accents, buttons, prices, links
const SECONDARY = '#FF6D00' // orange: sale banner, badges, warnings, out of stock
const BACKGROUND = '#F5F6FA' // light grey page background

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'shop',
      themes: {
        shop: {
          dark: false,
          colors: {
            primary: PRIMARY,
            secondary: SECONDARY,
            background: BACKGROUND,
            surface: '#FFFFFF',
            // Status colors reuse the same 3 colors
            success: PRIMARY,
            info: PRIMARY,
            warning: SECONDARY,
            error: SECONDARY,
          },
        },
      },
    },
    // Default props applied to every component of that type
    defaults: {
      // Cards: no border, extra-rounded corners; the soft shadow comes from main.css
      VCard: { rounded: 'xl' },
      VBtn: { class: 'text-none font-weight-medium', rounded: 'lg' },
      VChip: { rounded: 'lg' },
      VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
      VTextarea: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
      VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
      VCombobox: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
      VFileInput: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
