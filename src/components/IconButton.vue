<script setup lang="ts">
defineProps<{
  icon: string;
  disabled: boolean;
}>();

</script>

<template>
  <button
    class="icon-button"
    type="button"
    :disabled="disabled"
  >
    <font-awesome-icon class="regular" :icon="['far', icon]" size="lg" />
    <font-awesome-icon class="solid" :icon="['fas', icon]" size="lg" />
  </button>
</template>
