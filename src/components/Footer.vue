<template>
  <footer>
    <a href="/cron">unix man page</a>
    <a
      href="http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
      target="_blank"
      >quartz cron trigger docs</a
    >
    <p>
      aws
      <a
        href="https://docs.aws.amazon.com/systems-manager/latest/userguide/reference-cron-and-rate-expressions.html"
        >basic</a
      >
      and
      <a
        href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html"
        >extended</a
      >
      cron reference
    </p>
    <a
      href="https://github.com/daniel-melanson/cron.melanson.dev"
      target="_blank"
      >source code</a
    >
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
footer {
  display: flex;
  justify-content: center;
  font-size: 14px;
}

footer > * {
  padding: 0 1em;
  align-self: flex-start;
  margin: 0;
}

footer > :not(:last-child) {
  border-right: 2px solid currentColor;
}
</style>
