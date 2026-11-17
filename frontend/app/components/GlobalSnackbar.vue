<template>
  <v-snackbar
    v-model="notice.show"
    :color="notice.color"
    :timeout="notice.timeout"
    location="bottom"
    multi-line
  >
    {{ notice.text }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" aria-label="Close" @click="notice.show = false" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const { notice } = useNotify()
</script>
