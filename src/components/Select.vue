<script setup lang="ts">
interface Props {
  options: string[];
}

defineProps<Props>();
</script>

<template>
  <select class="select">
    <option v-for="opt in options" :value="opt">{{ opt }}</option>
  </select>
</template>

<style scoped>
.select {
  color: currentColor;
  text-transform: uppercase;
  font-weight: 800;
  background: none;
  border: none;
}
</style>
