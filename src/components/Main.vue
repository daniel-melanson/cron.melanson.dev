<script setup lang="ts">
import { ref, computed } from "vue";
import {
  isBookmarked,
  addBookmark,
  removeBookmark,
  hashBookmark,
} from "../storage.ts";
import IconButton from "./IconButton.vue";
import IconCheckbox from "./IconCheckbox.vue";
import {
  calculateNextDates,
  describeExpression,
  SYNTAX_LIST,
} from "../cron.ts";
import { createSnackbar } from "../snackbar.ts";
import Select from "./Select.vue";

const formElement = ref<HTMLFormElement | null>(null);
const scheduleExpression = ref("0 12 */2 * * *");

const isValid = ref(true);

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
  const expression = hashBookmark(scheduleExpression.value);
  try {
    await navigator.clipboard.writeText(expression);
  } catch (err) {
    createSnackbar("failure", "Could not copy to clipboard.");
  }

  createSnackbar("success", `Copied '${expression}' to clipboard.`);
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
        <Select :options="SYNTAX_LIST.map((s) => s.name)" />
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
  text-transform: uppercase;
}

.cronForm input:focus {
  outline: none;
}
</style>
