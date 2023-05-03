<script lang="ts">
import { defineComponent } from "vue";
import CommitBlock from "./CommitBlock.vue";

export default defineComponent({
  props: {
    branch: String,
  },
  components: {
    CommitBlock,
  },
  data() {
    return {
      commitList: [],
    };
  },
  methods: {
    async sourceCommits() {
      // Search branch for commits here
      return [
        {
          id: "abc1234523456343",
          title: "wow this somehow works",
          author: "ropats16",
        },
        {
          id: "qlwdiqwoidqowidm",
          title: "this one too!",
          author: "martonlederer",
        },
        {
          id: "qiwuhdqiwundfoew",
          title: "even this one",
          author: "lorimerjenkins",
        },
      ];
    },
  },
  async mounted() {
    //@ts-expect-error
    this.commitList = await this.sourceCommits();
  },
});
</script>

<template>
  <CommitBlock
    v-for="commit in commitList"
    :tx-id="commit.id"
    :title="commit.title"
    :contributors="commit.author"
  />
</template>

<style scoped></style>
