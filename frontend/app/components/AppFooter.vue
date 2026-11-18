<template>
  <v-footer color="surface" border="t" class="d-block pa-0">
    <div class="page-wrap py-10">
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" rounded="lg" size="36" class="mr-2">
              <v-icon icon="mdi-shopping" size="20" />
            </v-avatar>
            <span class="text-h6 font-weight-bold">Shop<span class="text-primary">Kart</span></span>
          </div>
          <p class="text-body-2 text-medium-emphasis" style="max-width: 340px">
            Quality products at fair prices, delivered to your door. A Web Systems and Technologies
            final project built with Nuxt 4, Vuetify 4, Strapi 5 and PostgreSQL.
          </p>
        </v-col>
        <v-col cols="6" md="3" offset-md="1">
          <div class="font-weight-bold mb-3">Links</div>
          <NuxtLink to="/#products" class="footer-link">All Products</NuxtLink>
          <NuxtLink to="/checkout" class="footer-link">Checkout</NuxtLink>
          <NuxtLink to="/products" class="footer-link">Manage Products</NuxtLink>
        </v-col>
        <v-col cols="6" md="4">
          <div class="font-weight-bold mb-3">Contact</div>
          <div class="footer-link d-flex align-center ga-2"><v-icon icon="mdi-map-marker-outline" size="18" /> Philippines</div>
          <div class="footer-link d-flex align-center ga-2"><v-icon icon="mdi-email-outline" size="18" /> supportshopkart@gmail.com</div>
        </v-col>
      </v-row>
    </div>
    <div class="border-t">
      <div class="page-wrap py-4 text-center text-caption text-medium-emphasis">
        &copy; {{ new Date().getFullYear() }} ShopKart. All rights reserved.
      </div>
    </div>
  </v-footer>
</template>

<style scoped>
.footer-link {
  display: block;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 2.1;
}
a.footer-link:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
