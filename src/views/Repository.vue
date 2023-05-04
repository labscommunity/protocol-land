<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "../components/Navbar.vue";

export default defineComponent({
  components: {
    Navbar,
  },
  data() {
    return {
      owner: "martonlederer",
      repoName: "arconnect",
    };
  },
});
</script>

<template>
  <div class="hero">
    <div class="hero-head">
      <div class="container">
        <Navbar />
      </div>
    </div>
    <div class="hero-body">
      <div class="container">
        <h1 class="title has-text-centered is-4">
          {{ owner }} / {{ repoName }}
        </h1>
        <div class="tabs is-centered">
          <ul>
            <li class="is-active"><a>Code</a></li>
            <li><a>Pull Requests</a></li>
            <li>
              <a
                >Info&nbsp;&nbsp;<span class="tag is-small"
                  >Coming soon!</span
                ></a
              >
            </li>
          </ul>
        </div>
        <nav class="level">
          <!-- Left side -->
          <div class="level-left">
            <div class="level-item">
              <div class="field has-addons">
                <div class="control">
                  <div class="select">
                    <select>
                      <option>main</option>
                      <option>dev</option>
                    </select>
                  </div>
                </div>
                <p class="control">
                  <button class="button">+</button>
                </p>
              </div>
            </div>
          </div>

          <!-- Right side -->
          <div class="level-right">
            <p class="level-item"><a>107 Commits</a></p>
            <p class="level-item"><a class="button is-success">Clone</a></p>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<style>
.tabs {
  border-bottom: 1px solid #dbdbdb;
}
</style>
