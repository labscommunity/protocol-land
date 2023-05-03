<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    branch: String,
  },
  data() {
    return {
      vehicleId: String,
      yesVotes: [],
      noVotes: [],
      timeLeft: String,
    };
  },
  methods: {},
  mounted() {},
});
</script>

<template>
  <nav class="level is-mobile">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Progress</p>
        <progress class="progress is-info" value="15" max="100">15%</progress>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">For</p>
        <p class="title">{{ yesVotes.length }}</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Against</p>
        <p class="title">{{ noVotes.length }}</p>
      </div>
    </div>
  </nav>
  <hr />
  <div class="block">
    <a class="button is-warning is-fullwidth"> Vote on AFTR.Market </a>
  </div>
</template>

<style scoped></style>
