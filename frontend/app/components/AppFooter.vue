<template>
  <v-footer class="d-block bg-grey-lighten-4 border-t pa-0">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-bold mb-1">SigBam Shop</div>
          <p class="text-body-2 text-grey-darken-1">
            A simple online store made with Nuxt 4, Vuetify 4, Strapi 5 and PostgreSQL.
          </p>
        </v-col>
        <v-col cols="6" md="3">
          <div class="font-weight-bold mb-1">Links</div>
          <div><NuxtLink to="/" class="text-body-2 text-grey-darken-1">Home</NuxtLink></div>
          <div><NuxtLink to="/checkout" class="text-body-2 text-grey-darken-1">Checkout</NuxtLink></div>
          <div><NuxtLink to="/products" class="text-body-2 text-grey-darken-1">Manage Products</NuxtLink></div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="font-weight-bold mb-1">Contact</div>
          <div class="text-body-2 text-grey-darken-1">City of San Fernando, Pampanga</div>
          <div class="text-body-2 text-grey-darken-1">sigbamshop@gmail.com</div>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center text-caption text-grey py-3 border-t">
      &copy; {{ new Date().getFullYear() }} SigBam Shop. All rights reserved.
    </div>
  </v-footer>
</template>
