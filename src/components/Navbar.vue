<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    attemptConnect() {
      console.log("CLICKED NAV BUTTON");
      this.$emit("attempt-connect", "invokeConnect");
    },
  },
});
</script>

<template>
  <nav class="navbar" role="navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="https://bulma.io">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          width="112"
          height="28"
        />
      </a>
    </div>

    <div class="navbar-menu">
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <button class="button is-primary" @click="attemptConnect">
              <strong>Get Started</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* a {
  color: transparent !important;
} */
</style>
