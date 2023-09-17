<script setup lang="ts">
import { ref, computed } from "vue";
import { isBookmarked, addBookmark, removeBookmark } from "../storage.ts";

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
  isExpressionBookmarked.value = isValid.value && isBookmarked(scheduleExpression.value);
}

function toggleBookmark() {
  if (isExpressionBookmarked.value) {
    removeBookmark(scheduleExpression.value);
  } else {
    addBookmark(scheduleExpression.value);
  }

  updateIsBookmarked();
}

const scheduleDescription = computed(() =>
  describeExpression(scheduleExpression.value)
);
const showNextDates = ref(false);
const nextDates = computed(() => calculateNextDates(scheduleExpression.value));
</script>

<template>
  <main>
    <div>
      <label class="scheduleDescription">{{ scheduleDescription }}</label>
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
    <form ref="formElement">
      <fieldset>
        <input
          type="text"
          required
          v-model="scheduleExpression"
          @input="onInput"
        />
        <button
          :class="{ bookmarked: isExpressionBookmarked }"
          type="button"
          :disabled="!isValid"
          @click="toggleBookmark"
        >
          <font-awesome-icon
            :icon="[isExpressionBookmarked ? 'fas' : 'far', 'bookmark']"
            size="lg"
          />
        </button>
        <button type="button" :disabled="!isValid">
          <font-awesome-icon :icon="['far', 'clipboard']" size="lg" />
        </button>
      </fieldset>
    </form>
  </main>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
}

.scheduleDescription,
.nextDates {
  text-align: center;
  font-style: italic;
}

.scheduleDescription {
  font-size: 24px;
}

.nextDates {
  font-size: 16px;
}

.showNextDates {
  text-decoration: underline;
  cursor: pointer;
}

ol {
  list-style: none;
}

form {
  display: flex;
  justify-content: center;
}

form:invalid * {
  border-color: #e74c3c;
  color: #e74c3c;
}

form:valid * {
  border-color: #2ecc71;
}

fieldset {
  display: flex;
  justify-items: center;
  border-color: currentColor;
  border-radius: 8px;
  border-width: 4px;
  background: #1f1f1f;
  transition: border-color 0.3s ease;
}

input {
  background: none;
  border: none;
  color: currentColor;
  font-size: 36px;
  text-align: center;
}

input:focus {
  outline: none;
}

button {
  background: none;
  border: none;
  transition: color 0.3s ease;
  margin: 0px 0.25em;
}

button,
.bookmarked:hover {
  color: currentColor;
}

button:hover,
.bookmarked {
  color: #3498db;
}
</style>
