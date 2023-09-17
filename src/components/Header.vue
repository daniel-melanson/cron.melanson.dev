<script setup lang="ts">
import Favorites from "./Favorites.vue";
</script>

<template>
  <header>
    <h1>crontab</h1>
    <p>
      A cron expression editor inspired by
      <a href="https://crontab.guru">crontab.guru</a>.
    </p>
    <Favorites />
  </header>
</template>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  justify-content: end;
}

h1 {
  font-size: 64px;
  margin: 0;
  filter: drop-shadow(0 0 2em currentColor);
}

h1,
p {
  text-align: center;
}

p {
  font-size: 16px;
}

a {
  font-style: italic;
  text-decoration: none;
}
</style>
