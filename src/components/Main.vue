<script setup lang="ts">
import { ref, computed } from "vue";
import {
  SYNTAX_LIST,
  CronSyntaxType,
  CronSyntax,
  formatExpression,
  partitionExpression,
} from "../cron";
import {
  checkBookmarkMembership,
  addBookmark,
  removeBookmark,
} from "../storage";
import CronForm from "./CronForm.vue";

const syntax = ref<CronSyntax>(SYNTAX_LIST[0]);
const expression = ref(syntax.value.default);
const isBookmarked = ref(
  checkBookmarkMembership(syntax.value.type, expression.value),
);

const descriptionResult = computed(() =>
  syntax.value.describe(expression.value),
);

function onSyntaxChange(type: CronSyntaxType) {
  syntax.value = SYNTAX_LIST.find((s) => s.type === type)!;
  expression.value = syntax.value.default;
}

function onExpressionChange(value: string) {
  expression.value = formatExpression(value);
}

function toggleBookmark() {
  const syntaxType = syntax.value.type;

  if (isBookmarked.value) {
    removeBookmark(syntaxType, expression.value);
  } else {
    addBookmark(syntaxType, expression.value);
  }

  isBookmarked.value = !isBookmarked.value;

  // TODO bookmark list
}

const selectedIndex = ref(-1);

// NOTE this is a hacky solution to a problem that I don't know how to solve
const fetchSelectionPositions = (input: HTMLInputElement) =>
  new Promise<{ selectionStart: number; selectionEnd: number }>((res) =>
    setTimeout(
      () =>
        res({
          selectionStart: input.selectionStart ?? 0,
          selectionEnd: input.selectionEnd ?? 0,
        }),
      25,
    ),
  );

async function onPossibleCursorPositionChange() {
  const input = document.getElementById("expressionInput") as HTMLInputElement;

  const getSelectedIndex = async () => {
    const { selectionStart, selectionEnd } =
      await fetchSelectionPositions(input);

    return partitionExpression(expression.value)
      .reduce(
        (acc, x) => {
          const lastEnd = acc.length === 0 ? 0 : acc[acc.length - 1][1];

          acc.push([lastEnd, lastEnd + x.length + 1]);
          return acc;
        },
        [] as [number, number][],
      )
      .findIndex(
        ([start, end]) => start <= selectionStart && selectionEnd < end,
      );
  };

  selectedIndex.value = await getSelectedIndex();
}

function onFieldClick(index: number) {
  const input = document.getElementById("expressionInput") as HTMLInputElement;

  if (!input) return;

  const partitions = partitionExpression(expression.value);

  if (index >= partitions.length) return;

  const offset =
    partitions.reduce((acc, x, i) => (i < index ? acc + x.length : acc), 0) +
    index;

  const partition = partitions[index];
  input.focus();
  input.setSelectionRange(offset, offset + partition.length);

  selectedIndex.value = index;
}

const showNextDates = ref(false);
</script>

<template>
  <main>
    <div class="scheduleDescription">
      <label class="scheduleLabel">{{
        descriptionResult.success ? descriptionResult.value.text : "Unknown"
      }}</label>
      <ol class="nextDates">
        <li>
          <span class="showNextDates" @click="showNextDates = !showNextDates"
            >next</span
          >
          at
          {{
            descriptionResult.success
              ? descriptionResult.value.nextDates[0]
              : "unknown"
          }}
        </li>
        <template
          v-for="(nextDate, i) in descriptionResult.success
            ? descriptionResult.value.nextDates
            : []"
        >
          <li v-if="i > 0 && showNextDates" :key="i">
            then at {{ descriptionResult.success ? nextDate : "unknown" }}
          </li>
        </template>
      </ol>
    </div>
    <CronForm
      :syntaxKinds="SYNTAX_LIST"
      :expression="expression"
      :isValid="descriptionResult.success"
      :isBookmarked="isBookmarked"
      @update:expression="onExpressionChange"
      @update:syntax="onSyntaxChange"
      @update:isBookmarked="toggleBookmark"
      @on:keydown="onPossibleCursorPositionChange"
      @on:click="onPossibleCursorPositionChange"
    />
    <div class="fieldTitles">
      <a
        v-for="(field, i) in syntax.fields"
        :key="field.name"
        class="fieldTitle"
        @click="onFieldClick(i)"
        :class="{
          invalid:
            !descriptionResult.success &&
            descriptionResult.error.invalidFieldIndices.includes(i),
          selected: i === selectedIndex,
        }"
        >{{ field.name }}</a
      >
    </div>
  </main>
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

.fieldTitles .invalid {
  background-color: var(--color-red);
}

.fieldTitles .selected:not(.invalid) {
  background-color: var(--color-blue);
}

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
