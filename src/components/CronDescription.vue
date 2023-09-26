<script setup lang="ts">
import { ref } from "vue";

defineProps<{ text: string; nextDates: string[] }>();

const showNextDates = ref(false);
</script>

<template>
  <div class="scheduleDescription">
    <label class="scheduleLabel">{{ text }}</label>
    <ol class="nextDates">
      <li>
        <span class="showNextDates" @click="showNextDates = !showNextDates"
          >next</span
        >
        at
        {{ nextDates[0] ?? "unknown" }}
      </li>
      <template v-for="(nextDate, i) in nextDates">
        <li v-if="i > 0 && showNextDates" :key="i">then at {{ nextDate }}</li>
      </template>
    </ol>
  </div>
</template>

<style scoped>
.scheduleDescription {
  display: flex;
  flex-direction: column;
}

.scheduleLabel,
.nextDates {
  text-align: center;
  font-style: italic;
}

.scheduleLabel {
  font-size: 24px;
}

.nextDates {
  padding: 0;
  font-size: 16px;
  list-style: none;
}

.showNextDates {
  text-decoration: underline;
  cursor: pointer;
}
</style>
