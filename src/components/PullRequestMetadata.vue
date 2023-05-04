<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    proposer: String,
    dateProposed: String,
    txId: String,
    status: String,
  },
  computed: {
    shortenTx() {
      let base = this.txId;
      //@ts-expect-error
      const beginning = base.slice(0, 4);
      //@ts-expect-error
      const end = base.slice(base.length - 4, base.length);
      return `${beginning}...${end}`;
    },
    grabContributors(): Array<{ icon: string; id: string }> {
      // Lookup contributors based on given txId
      return [
        {
          icon: "https://bulma.io/images/placeholders/128x128.png",
          id: "martonlederer",
        },
        {
          icon: "https://bulma.io/images/placeholders/128x128.png",
          id: "lorimerjenkins",
        },
      ];
    },
  },
});
</script>

<template>
  <div class="block">
    <nav class="panel">
      <p class="panel-heading">Info</p>
      <div class="panel-block">
        <b>Status</b>:&nbsp;&nbsp;<span
          class="tag is-light"
          :class="status === 'open' ? 'is-warning' : ''"
          >{{ status }}</span
        >
      </div>
      <div class="panel-block"><b>Proposer</b>: {{ proposer }}</div>
      <a class="panel-block"> <b>Transaction</b>: {{ shortenTx }} </a>
      <a href="" class="panel-block"> <b>Submitted</b>: {{ dateProposed }} </a>
    </nav>
  </div>
  <div v-if="grabContributors !== undefined" class="block">
    <nav class="panel">
      <p class="panel-heading">Contributors</p>
      <div class="panel-block">
        <div class="columns is-multiline">
          <div v-for="contributor in grabContributors" class="column is-2">
            <figure class="image is-fullwidth">
              <a :href="'/user/' + contributor.id">
                <img class="is-rounded" :src="contributor.icon" />
              </a>
            </figure>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
