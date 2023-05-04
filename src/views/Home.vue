<script lang="ts">
// import HelloWorld from "./components/HelloWorld.vue";
import Navbar from "../components/Navbar.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Navbar
  }
});
</script>

<template>
  <div class="hero is-medium">
    <div class="hero-head">
      <div class="container">
        <Navbar />
      </div>
    </div>
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-4">
            <h1 class="title">Protocol Land</h1>
            <h2 class="subtitle">Where the protocols roam</h2>
            <a href="/pr" class="button is-light">Contribute</a>
          </div>
          <div class="column is-8">
            <img src="../assets/land-1.png" class="hero-img" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-img {
  border-radius: 10px;
}
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
