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
  <div class="block">
    <p>Time Left</p>
    <progress class="progress is-info" value="15" max="100">15%</progress>
  </div>
  <div class="block">
    <div class="columns">
      <div class="column is-half">
        <p class="has-text-centered"><b>For</b>: {{ yesVotes.length }}</p>
      </div>
      <div class="column is-half">
        <p class="has-text-centered"><b>Against</b>: {{ noVotes.length }}</p>
      </div>
    </div>
  </div>
  <hr />
  <div class="block">
    <a class="button is-warning is-fullwidth"> Vote on AFTR.Market </a>
  </div>
</template>

<style scoped></style>
