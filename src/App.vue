<script setup lang="ts">
import Header from "./components/Header.vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <Header />
  <Main />
  <Footer />
</template>

<style>
#app {
  display: grid;
  grid-template-rows: 10em 1fr 2em;
}
</style>
