<template>
  <footer>
    <a href="https://crontab.guru/crontab.5.html" target="_blank"
      >unix man page</a
    >
    <a
      href="http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
      target="_blank"
      >quartz cron trigger docs</a
    >
    <p>
      <a
        href="https://docs.aws.amazon.com/systems-manager/latest/userguide/reference-cron-and-rate-expressions.html"
        target="_blank"
        >aws cron reference</a
      >
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
