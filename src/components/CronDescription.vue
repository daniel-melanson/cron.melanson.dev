<script setup lang="ts">
import { computed, ref } from "vue";
import {
  CronExpressionDescription,
  CronField,
  CronSyntax,
} from "../cron/types";

type Props = CronExpressionDescription & {
  selectedField?: CronField;
};

const props = defineProps<Props>();

const showNextDates = ref(false);

const labelText = computed(() => {
  const { source, ranges } = props.text;
  const selectedField = props.selectedField;

  if (!ranges || !selectedField) return source;

  let result = "";
  let currentIndex = 0;

  for (const [key, [start, end]] of ranges.entries()) {
    result += source.substring(currentIndex, start);

    result += `<span class="${
      key === selectedField.kind ? "highlight" : ""
    }">${source.substring(start, end)}</span>`;

    currentIndex = end;
  }

  result += source.substring(currentIndex);

  return result;
});
</script>

<template>
  <div class="schedule-description">
    <label class="schedule-label" v-html="labelText" />
    <ol class="next-dates">
      <li>
        <span class="show-next-dates" @click="showNextDates = !showNextDates"
          >next</span
        >
        at
        {{ nextDates[0] ?? "unknown" }}
      </li>
      <template v-for="(nextDate, i) in nextDates">
        <li v-if="i > 0 && showNextDates" :key="i">then at {{ nextDate }}</li>
      </template>
    </ol>
  </div>
</template>

<style scoped>
.schedule-description {
  display: flex;
  flex-direction: column;
}

.schedule-label,
.next-dates {
  text-align: center;
  font-style: italic;
}

.schedule-label {
  font-size: 24px;
}

.next-dates {
  padding: 0;
  font-size: 16px;
  list-style: none;
}

.show-next-dates {
  text-decoration: underline;
  cursor: pointer;
}
</style>
