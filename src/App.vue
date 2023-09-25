<script setup lang="ts">
import Header from "./components/Header.vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <Header />
  <Main />
  <Footer />
  <div id="snackbar-container" />
</template>

<style>
#app {
  display: grid;
  grid-template-rows: 10em 1fr 2em;
}

#snackbar-container {
  position: fixed;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.snackbar-item.success {
  border-color: var(--color-blue);
}

.snackbar-item.failure {
  border-color: var(--color-red);
}

.snackbar-item {
  background-color: var(--color-dark-grey);
  border-width: 2px;
  border-style: solid;
  border-radius: 4px;
  padding: 0.75em;
  margin: 0.25em;
  transition: opacity 0.3s ease;
}

.icon-button {
  background: none;
  border: none;

  margin: 0px 0.25em;
  padding: 0;
  height: 1.25em;
  width: 12.5px;
  position: relative;
}

.icon-button svg {
  color: var(--color-white);

  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  display: block;

  transition:
    color 0.3s ease,
    opacity 0.3s ease;
}

.icon-button .solid {
  opacity: 0;
}

.icon-button:disabled svg {
  color: var(--color-red);
}

.icon-button:not(:disabled):hover .solid {
  opacity: 1;
}
</style>
