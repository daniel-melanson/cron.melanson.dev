<script setup lang="ts">
import { ref, computed } from "vue";
import { isBookmarked, addBookmark, removeBookmark } from "../storage.ts";
import IconButton from "./IconButton.vue";
import IconCheckbox from "./IconCheckbox.vue";

function describeExpression(expression: string): string {
  return "At 12:00 on every 2nd day-of-month.";
}

function calculateNextDates(expression: string): string[] {
  return [
    "2023-10-02 12:00:00",
    "2023-10-04 12:00:00",
    "2023-10-06 12:00:00",
    "2023-10-08 12:00:00",
    "2023-10-10 12:00:00",
  ];
}

const formElement = ref<HTMLFormElement | null>(null);
const scheduleExpression = ref("0 12 */2 * * *");

const isValid = ref(true);

// Bookmarks
const isExpressionBookmarked = ref(isBookmarked(scheduleExpression.value));
function onInput() {
  isValid.value = Boolean(formElement.value?.checkValidity());
  updateIsBookmarked();
}

function updateIsBookmarked() {
  isExpressionBookmarked.value =
    isValid.value && isBookmarked(scheduleExpression.value);
}

function toggleBookmark() {
  if (isExpressionBookmarked.value) {
    removeBookmark(scheduleExpression.value);
  } else {
    addBookmark(scheduleExpression.value);
  }

  updateIsBookmarked();
}

async function copyExpression() {
  try {
    await navigator.clipboard.writeText(scheduleExpression.value);
  } catch (err) {
    // TODO
  }
}

const scheduleDescription = computed(() =>
  describeExpression(scheduleExpression.value)
);
const showNextDates = ref(false);
const nextDates = computed(() => calculateNextDates(scheduleExpression.value));
</script>

<template>
  <main>
    <div class="scheduleDescription">
      <label class="scheduleLabel">{{ scheduleDescription }}</label>
      <ol class="nextDates">
        <li>
          <span class="showNextDates" @click="showNextDates = !showNextDates"
            >next</span
          >
          at {{ nextDates[0] }}
        </li>
        <template v-for="(nextDate, i) in nextDates">
          <li v-if="i > 0 && showNextDates">then at {{ nextDate }}</li>
        </template>
      </ol>
    </div>
    <form class="cronForm" ref="formElement">
      <fieldset>
        <input
          type="text"
          required
          v-model="scheduleExpression"
          @input="onInput"
        />
        <IconCheckbox
          :disabled="!isValid"
          :checked="isExpressionBookmarked"
          @click="toggleBookmark"
          icon="bookmark"
        />
        <IconButton
          icon="clipboard"
          :disabled="!isValid"
          @click="copyExpression"
        />
      </fieldset>
    </form>
  </main>
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
  font-size: 16px;
  list-style: none;
}

.showNextDates {
  text-decoration: underline;
  cursor: pointer;
}

.cronForm {
  display: flex;
  justify-content: center;
}

.cronForm:invalid fieldset {
  border-color: var(--color-red);
}

.cronForm:valid fieldset {
  border-color: var(--color-green);
}

.cronForm fieldset {
  display: flex;
  align-items: center;
  border-color: currentColor;
  border-radius: 8px;
  border-width: 4px;
  background: var(--color-dark-grey);
  transition: border-color 0.3s ease;
  padding: 0.5rem;
  margin: 0;
}

.cronForm input {
  padding: 0;
  background: none;
  border: none;
  color: currentColor;
  font-size: 36px;
  text-align: center;
}

.cronForm input:focus {
  outline: none;
}
</style>
