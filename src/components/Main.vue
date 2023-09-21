<script setup lang="ts">
import { ref, computed } from "vue";
import {
  SYNTAX_LIST,
  CronSyntaxType,
  CronSyntax,
  formatExpression,
} from "../cron";
import {
  checkBookmarkMembership,
  addBookmark,
  removeBookmark,
} from "../storage";
import CronForm from "./CronForm.vue";

const syntax = ref<CronSyntax>(SYNTAX_LIST[0]);
const expression = ref("0 12 */2 * * *");
const isBookmarked = ref(
  checkBookmarkMembership(syntax.value.type, expression.value)
);

const description = computed(() => syntax.value.describe(expression.value));

function onSyntaxChange(type: CronSyntaxType) {
  syntax.value = SYNTAX_LIST.find((s) => s.type === type)!;
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

const showNextDates = ref(false);
</script>

<template>
  <main>
    <div class="scheduleDescription">
      <label class="scheduleLabel">{{
        description.isValid ? description.text : "Unknown"
      }}</label>
      <ol class="nextDates">
        <li>
          <span class="showNextDates" @click="showNextDates = !showNextDates"
            >next</span
          >
          at
          {{ description.isValid ? description.nextDates[0] : "unknown" }}
        </li>
        <template v-for="(nextDate, i) in description.nextDates">
          <li v-if="i > 0 && showNextDates">
            then at {{ description.isValid ? nextDate : "unknown" }}
          </li>
        </template>
      </ol>
    </div>
    <CronForm
      :syntaxKinds="SYNTAX_LIST"
      :expression="expression"
      :isValid="description.isValid"
      :isBookmarked="isBookmarked"
      @update:expression="onExpressionChange"
      @update:syntax="onSyntaxChange"
      @update:isBookmarked="toggleBookmark"
    />
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
  padding: 0;
  font-size: 16px;
  list-style: none;
}

.showNextDates {
  text-decoration: underline;
  cursor: pointer;
}
</style>
