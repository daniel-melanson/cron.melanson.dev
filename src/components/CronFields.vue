<script setup lang="ts">
import type { CronSyntax } from "../cron/types";

const { syntax, selectedIndex } = defineProps<{
  syntax: CronSyntax;
  selectedIndex: number;
  invalidIndices: number[];
}>();
defineEmits(["selected:field"]);

</script>

<template>
  <div class="fieldTitles">
    <a
      v-for="(field, i) in syntax.fields"
      :key="field.kind"
      class="fieldTitle"
      @click="$emit('selected:field', i)"
      :class="{
        invalid: invalidIndices.includes(i),
        selected: i === selectedIndex,
      }"
      >{{ field.kind.replaceAll("_", "-").toLowerCase() }}</a
    >
  </div>
  <table class="fieldVariants">
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
    <tr v-for="desc in syntax.fields[selectedIndex]?.variantDescriptions ?? []">
      <th>{{ desc.header }}</th>
      <td>{{ desc.value }}</td>
    </tr>
  </table>
</template>

<style scoped>
.fieldTitles {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}

.fieldTitle {
  margin: 0 0.5em;
  padding: 0.15em 0.25em;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.fieldTitle.invalid {
  background-color: var(--color-red);
}

.fieldTitle.selected:not(.invalid) {
  background-color: var(--color-blue);
}

.fieldVariants {
  margin-left: auto;
  margin-right: auto;
  background-color: var(--color-dark-grey);
  border: 4px solid var(--color-blue);
  border-radius: 4px;
  padding: 0.5rem 0.5rem;
  list-style: none;
}

.fieldVariants th {
  text-align: right;
  padding-right: 1rem;
  width: 17rem;
  font-weight: bold;
}

.fieldVariants td {
  width: 17rem;
  text-align: left;
  padding-left: 1rem;
}
</style>
