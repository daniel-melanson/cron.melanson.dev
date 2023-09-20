<script setup lang="ts">
import { inject } from "vue";

defineProps<{
  icon: string;
}>();

const isFormValid = inject<boolean>("isFormValid")
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :disabled="!isFormValid"
  >
    <font-awesome-icon class="regular" :icon="['far', icon]" size="lg" />
    <font-awesome-icon class="solid" :icon="['fas', icon]" size="lg" />
  </button>
</template>
