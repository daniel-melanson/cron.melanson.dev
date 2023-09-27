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
import CronDescription from "./CronDescription.vue";
import CronFields from "./CronFields.vue";

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

function onFieldSelect(index: number) {
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
</script>

<template>
  <main>
    <CronDescription
      :text="
        descriptionResult.success ? descriptionResult.value.text : 'Unknown'
      "
      :nextDates="
        descriptionResult.success ? descriptionResult.value.nextDates : []
      "
    />
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
    <CronFields
      :syntax="syntax"
      :selectedIndex="selectedIndex"
      :invalidIndices="
        descriptionResult.success
          ? []
          : descriptionResult.error.invalidFieldIndices
      "
      @selected:field="onFieldSelect"
    />
  </main>
</template>
