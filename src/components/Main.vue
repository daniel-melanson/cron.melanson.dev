<script setup lang="ts">
import { ref, computed } from "vue";
import {
  describeExpression,
  SYNTAX_LIST,
  CronSyntaxType,
  CronSyntax,
} from "../cron";
import {
  checkBookmarkMembership,
  addBookmark,
  removeBookmark,
} from "../storage";
import CronForm from "./CronForm.vue";

const scheduleSyntax = ref<CronSyntax>(SYNTAX_LIST[0]);
const scheduleExpression = ref("0 12 */2 * * *");
const isValid = computed(() =>
  scheduleSyntax.value.pattern.test(scheduleExpression.value)
);
const isBookmarked = ref(
  checkBookmarkMembership(scheduleSyntax.value.type, scheduleExpression.value)
);

const scheduleDescription = computed(() =>
  describeExpression(scheduleExpression.value)
);

function onSyntaxChange(type: CronSyntaxType) {
  scheduleSyntax.value = SYNTAX_LIST.find((s) => s.type === type)!;
}

function onExpressionChange(expression: string) {
  scheduleExpression.value = expression.toUpperCase();
}

function toggleBookmark() {
  console.log(isBookmarked.value);
  if (isBookmarked.value) {
    removeBookmark(scheduleSyntax.value.type, scheduleExpression.value);
  } else {
    addBookmark(scheduleSyntax.value.type, scheduleExpression.value);
  }

  isBookmarked.value = !isBookmarked.value;

  // TODO bookmark list
}

const showNextDates = ref(false);
</script>

<template>
  <main>
    <div class="scheduleDescription">
      <label class="scheduleLabel">{{ scheduleDescription.text }}</label>
      <ol class="nextDates">
        <li>
          <span class="showNextDates" @click="showNextDates = !showNextDates"
            >next</span
          >
          at {{ scheduleDescription.nextDates[0] }}
        </li>
        <template v-for="(nextDate, i) in scheduleDescription.nextDates">
          <li v-if="i > 0 && showNextDates">then at {{ nextDate }}</li>
        </template>
      </ol>
    </div>
    <CronForm
      :syntaxKinds="SYNTAX_LIST"
      :expression="scheduleExpression"
      :isValid="isValid"
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
  font-size: 16px;
  list-style: none;
}

.showNextDates {
  text-decoration: underline;
  cursor: pointer;
}
</style>
