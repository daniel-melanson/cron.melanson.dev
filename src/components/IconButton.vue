<script setup lang="ts">
import { inject } from "vue";

defineProps<{
  icon: string;
}>();

const invalid = inject<boolean>("invalid");
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :disabled="invalid"
  >
    <font-awesome-icon class="regular" :icon="['far', icon]" size="lg" />
    <font-awesome-icon class="solid" :icon="['fas', icon]" size="lg" />
  </button>
</template>
