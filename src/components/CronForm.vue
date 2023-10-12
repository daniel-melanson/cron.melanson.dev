<script setup lang="ts">
import { onMounted, onUpdated } from "vue";
import { formatExpression } from "../cron";
import type { CronSyntax } from "../cron/types";
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

onUpdated(() => {
  console.log("updated");
});
</script>

<template>
  <form class="cron-form" :class="{ valid: isValid }">
    <fieldset>
      <Select
        :options="syntaxKinds.map((s) => s.kind)"
        @change="(event) => $emit('update:syntax', event.target.value)"
      />
      <input
        id="expression-input"
        type="text"
        required
        :value="expression"
        @keydown.passive="$emit('on:keydown')"
        @click="$emit('on:click')"
        @input.trim="
          (event) =>
            $emit('update:expression', event.target.value.toUpperCase() ?? '')
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
#expression-input::selection {
  background-color: var(--color-blue);
}

.cron-form {
  display: flex;
  justify-content: center;
}

.cron-form:not(.valid) fieldset {
  border-color: var(--color-red);
}

.cron-form.valid fieldset {
  border-color: var(--color-green);
}

.cron-form fieldset {
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

.cron-form input {
  padding: 0;
  background: none;
  border: none;
  color: currentColor;
  font-size: 36px;
  text-align: center;
  text-transform: uppercase;
}

.cron-form input:focus {
  outline: none;
}
</style>
