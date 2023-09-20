<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  isBookmarked,
  addBookmark,
  removeBookmark,
  hashBookmark,
} from "../storage";
import { CronSyntax, CronSyntaxType } from "../cron";
import IconButton from "./IconButton.vue";
import IconCheckbox from "./IconCheckbox.vue";
import Select from "./Select.vue";
import { createSnackbar } from "../snackbar";

interface Props {
  syntaxKinds: CronSyntax[];
  syntaxIndex: number;
  expression: string;
  isValid: boolean;
}
const { syntaxKinds, syntaxIndex, expression } = defineProps<Props>();


const isExpressionBookmarked = ref(false);
function toggleBookmark() {
  if (isExpressionBookmarked.value) {
    removeBookmark(expression);
  } else {
    addBookmark(expression);
  }
}

async function copyExpression() {
  const key = hashBookmark(expression);
  try {
    await navigator.clipboard.writeText(key);
  } catch (err) {
    createSnackbar("failure", "Could not copy to clipboard.");
  }

  createSnackbar("success", `Copied '${key}' to clipboard.`);
}
</script>

<template>
  <form class="cronForm" :class="{ valid: isValid }">
    <fieldset>
      <Select
        :options="syntaxKinds.map((s) => s.name)"
        @change="(event) => $emit('cronChange', event.target.value, expression)"
      />
      <input
        type="text"
        required
        :value="expression"
        @input.trim="
          (event) =>
            $emit(
              'cronChange',
              syntaxKinds[syntaxIndex].name,
              event.target.value ?? ''
            )
        "
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
</template>

<style scoped>
.cronForm {
  display: flex;
  justify-content: center;
}

.cronForm:not(.valid) fieldset {
  border-color: var(--color-red);
}

.cronForm.valid fieldset {
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
