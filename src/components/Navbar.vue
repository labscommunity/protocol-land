<script lang="ts">
import { defineComponent } from "vue";
import Connect from "./Connect.vue";
import { getCurrentAddress, getIcon } from "../utils/auth";

export default defineComponent({
  components: {
    Connect,
  },
  data() {
    return {
      connectModalDisplay: false,
      loggedIn: false,
    };
  },
  methods: {
    getCurrentAddress,
    getIcon,
    attemptConnect() {
      // this.$emit("attempt-connect", "invokeConnect");
      this.connectModalDisplay = true;
    },
    shortenTx(input: string | null) {
      if (input === null) return;
      const beginning = input.slice(0, 4);
      const end = input.slice(input.length - 4, input.length);
      return `${beginning}...${end}`;
    },
    logOut() {
      localStorage.removeItem("currentAddress");
      localStorage.removeItem("authMethod");
      this.loggedIn = false;
      this.connectModalDisplay = false;
    },
  },
  computed: {
    // getCurrentAddress() {
    // }
  },
  mounted() {
    if (localStorage.getItem("currentAddress") === null) {
      this.loggedIn = false;
    } else {
      this.loggedIn = true;
    }
    console.log(this.loggedIn);
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
        <div v-if="loggedIn">
          <div class="navbar-item">
            <div class="buttons">
              <a href="/create" class="button is-success">+</a>
              <a class="button is-light">
                <p>{{ shortenTx(getCurrentAddress()) }}</p>
                <figure
                  class="image is-32x32"
                  v-html="getIcon(getCurrentAddress())"
                  id="userIcon"
                ></figure>
              </a>
              <a @click="logOut()" class="button is-light">-></a>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="navbar-item">
            <div class="buttons">
              <button class="button is-primary" @click="attemptConnect()">
                <strong>Get Started</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="connectModalDisplay && !loggedIn">
    <Connect
      @connected="loggedIn = true"
      @cancel-connect="connectModalDisplay = false"
    />
  </div>
</template>

<style scoped>
#userIcon {
  margin-left: 10px;
}
</style>
