<script setup lang="ts">
defineProps({
  options: Array,
});
</script>

<template>
  <select class="select">
    <option v-for="opt in options">{{ opt }}</option>
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
