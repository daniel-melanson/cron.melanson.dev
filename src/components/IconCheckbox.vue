<script setup lang="ts">
defineProps<{
  icon: string;
  disabled: boolean;
  checked?: boolean;
}>();
</script>

<template>
  <button
    class="icon-button icon-checkbox"
    type="button"
    :class="{ checked: checked }"
    :disabled="disabled"
  >
    <font-awesome-icon class="regular" :icon="['far', icon]" size="lg" />
    <font-awesome-icon class="solid" :icon="['fas', icon]" size="lg" />
  </button>
</template>

<style scoped>
.icon-checkbox.checked svg {
  color: var(--color-blue);
}

.icon-checkbox.checked .solid,
.icon-checkbox.checked .solid,
.icon-checkbox:not(.checked, :disabled):hover .solid {
  opacity: 1;
}

.icon-checkbox.checked:hover .solid {
  opacity: 0;
}
</style>
