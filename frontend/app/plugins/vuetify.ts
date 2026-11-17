import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#1976D2',
            secondary: '#424242',
            error: '#D32F2F',
            success: '#388E3C',
            warning: '#F57C00',
            info: '#1976D2',
            background: '#FFFFFF',
            surface: '#FFFFFF',
          },
        },
      },
    },
    // Default props for components: flat cards with a thin border
    defaults: {
      VCard: { flat: true, border: true },
      VAppBar: { flat: true },
      VBtn: { class: 'text-none', elevation: 0 },
      VTextField: { variant: 'outlined', density: 'comfortable' },
      VTextarea: { variant: 'outlined', density: 'comfortable' },
      VSelect: { variant: 'outlined', density: 'comfortable' },
      VCombobox: { variant: 'outlined', density: 'comfortable' },
      VFileInput: { variant: 'outlined', density: 'comfortable' },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
