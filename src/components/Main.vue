<script setup lang="ts">
import { ref, computed } from "vue";
import { describeExpression, SYNTAX_LIST, CronSyntaxType } from "../cron";
import CronForm from "./CronForm.vue";

const scheduleSyntaxIndex = ref(0);
const scheduleExpression = ref("0 12 */2 * * *");
const isValid = computed(() =>
  SYNTAX_LIST[scheduleSyntaxIndex.value].pattern.test(scheduleExpression.value)
);

const scheduleDescription = computed(() =>
  describeExpression(scheduleExpression.value)
);

function onChange(cronType: CronSyntaxType, expression: string) {
  scheduleSyntaxIndex.value = SYNTAX_LIST.findIndex(
    (s) => s.name === cronType
  )!;
  scheduleExpression.value = expression.toUpperCase();
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
      :syntaxIndex="scheduleSyntaxIndex"
      :expression="scheduleExpression"
      :isValid="isValid"
      @cronChange="onChange"
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
