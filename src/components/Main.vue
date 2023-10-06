<script setup lang="ts">
import { ref, computed } from "vue";
import {
  CRON_SYNTAX_LIST,
  formatExpression,
  partitionExpression,
} from "../cron";
import { CronSyntax, CronSyntaxKind } from "../cron/types";
import {
  checkBookmarkMembership,
  addBookmark,
  removeBookmark,
} from "../storage";
import CronForm from "./CronForm.vue";
import CronDescription from "./CronDescription.vue";
import CronFields from "./CronFields.vue";

const syntax = ref<CronSyntax>(CRON_SYNTAX_LIST[0]);
const expression = ref(syntax.value.defaultExpression);
const isBookmarked = ref(
  checkBookmarkMembership(syntax.value.kind, expression.value),
);

const descriptionResult = computed(() =>
  syntax.value.describe(expression.value),
);

function onSyntaxChange(kind: CronSyntaxKind) {
  syntax.value = CRON_SYNTAX_LIST.find((s) => s.kind === kind)!;
  expression.value = syntax.value.defaultExpression;
}

function onExpressionChange(value: string) {
  expression.value = formatExpression(value);
}

function toggleBookmark() {
  const syntaxKind = syntax.value.kind;

  if (isBookmarked.value) {
    removeBookmark(syntaxKind, expression.value);
  } else {
    addBookmark(syntaxKind, expression.value);
  }

  isBookmarked.value = !isBookmarked.value;

  // TODO bookmark list
}

const selectedFieldIndex = ref(-1);
const selectedField = computed(() => {
  if (selectedFieldIndex.value === -1) return undefined;
  return syntax.value.fields[selectedFieldIndex.value];
});

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

  selectedFieldIndex.value = await getSelectedIndex();
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

  selectedFieldIndex.value = index;
}
</script>

<template>
  <main>
    <CronDescription
      :text="
        descriptionResult.success
          ? descriptionResult.value.text
          : { source: 'Unknown' }
      "
      :selectedField="selectedField"
      :nextDates="
        descriptionResult.success ? descriptionResult.value.nextDates : []
      "
    />
    <CronForm
      :syntaxKinds="CRON_SYNTAX_LIST"
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
      :selectedFieldIndex="selectedFieldIndex"
      :invalidIndices="
        descriptionResult.success
          ? []
          : descriptionResult.error.invalidFieldIndices
      "
      @selected:field="onFieldSelect"
    />
  </main>
</template>
