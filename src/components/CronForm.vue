<script setup lang="ts">
import { CronSyntax } from "../cron";
import { createSnackbar } from "../snackbar";
import IconButton from "./IconButton.vue";
import IconCheckbox from "./IconCheckbox.vue";
import Select from "./Select.vue";

interface Props {
  syntaxKinds: CronSyntax[];
  expression: string;
  isValid: boolean;
  isBookmarked: boolean;
}

defineProps<Props>();

async function copyExpression(expression: string) {
  try {
    await navigator.clipboard.writeText(expression);
  } catch (err) {
    createSnackbar("failure", "Could not copy to clipboard.");
  }

  createSnackbar("success", `Copied '${expression}' to clipboard.`);
}
</script>

<template>
  <form class="cronForm" :class="{ valid: isValid }">
    <fieldset>
      <Select
        :options="syntaxKinds.map((s) => s.type)"
        @change="(event) => $emit('update:syntax', event.target.value)"
      />
      <input
        id="expressionInput"
        type="text"
        required
        :value="expression"
        @input.trim="
          (event) => $emit('update:expression', event.target.value ?? '')
        "
      />
      <IconCheckbox
        :disabled="!isValid"
        :checked="isBookmarked"
        @click="$emit('update:isBookmarked')"
        icon="bookmark"
      />
      <IconButton
        icon="clipboard"
        :disabled="!isValid"
        @click="copyExpression(expression)"
      />
    </fieldset>
  </form>
</template>

<style scoped>
#expressionInput::selection {
  background-color: var(--color-blue);
}

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
