<script setup lang="ts">
import type { CronSyntax } from "../cron/types";

defineProps<{
  syntax: CronSyntax;
  selectedFieldIndex: number;
  invalidIndices: number[];
}>();
defineEmits(["selected:field"]);
</script>

<template>
  <div class="field-titles">
    <a
      v-for="(field, i) in syntax.fields"
      :key="field.kind"
      class="field-title"
      @click="$emit('selected:field', i)"
      :class="{
        invalid: invalidIndices.includes(i),
        selected: i === selectedFieldIndex,
      }"
      >{{ field.kind.replace(/_/g, "-").toLowerCase() }}</a
    >
  </div>
  <table class="field-variants">
    <tr>
      <th>*</th>
      <td>any value</td>
    </tr>
    <tr>
      <th>-</th>
      <td>range of values</td>
    </tr>
    <tr>
      <th>~</th>
      <td>range of values (pick random)</td>
    </tr>
    <tr>
      <th>,</th>
      <td>list separator</td>
    </tr>
    <tr
      v-for="desc in syntax.fields[selectedFieldIndex]?.variantDescriptions ??
      []"
    >
      <th>{{ desc.header }}</th>
      <td>{{ desc.value }}</td>
    </tr>
  </table>
</template>

<style scoped>
.field-titles {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}

.field-title {
  margin: 0 0.5em;
  padding: 0.15em 0.25em;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.field-title.invalid {
  background-color: var(--color-red);
}

.field-title.selected:not(.invalid) {
  background-color: var(--color-blue);
}

.field-variants {
  margin-left: auto;
  margin-right: auto;
  background-color: var(--color-dark-grey);
  border: 4px solid var(--color-blue);
  border-radius: 4px;
  padding: 0.5rem 0.5rem;
  list-style: none;
}

.field-variants th {
  text-align: right;
  padding-right: 1rem;
  width: 17rem;
  font-weight: bold;
}

.field-variants td {
  width: 17rem;
  text-align: left;
  padding-left: 1rem;
}
</style>
