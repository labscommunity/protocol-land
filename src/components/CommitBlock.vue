<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    txId: String,
    title: String,
    contributors: String,
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
  },
});
</script>

<template>
  <div class="box">
    <div class="columns">
      <div class="column is-9">
        <p>{{ title }}</p>
      </div>
      <div class="column is-3">
        {{ shortenTx }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
