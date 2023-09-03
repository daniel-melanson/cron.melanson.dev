<template>
  <footer>
    <a href="/cron">unix man page</a>
    <a
      href="http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
      target="_blank"
      >quartz cron trigger docs</a
    >
    <a
      href="http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
      target="_blank"
      >aws cron expressions reference</a
    >
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
}

footer > a {
  padding: 0 1em;
}

footer > a:not(:last-child) {
  border-right: 1px solid #fffcf2;
}
</style>
