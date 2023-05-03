<script lang="ts">
import Navbar from "../components/Navbar.vue";
import Connect from "../components/Connect.vue";
import CommitList from "../components/CommitList.vue";
import Votes from "../components/Votes.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Navbar,
    Connect,
    CommitList,
    Votes,
  },
  data() {
    return {
      connectModalDisplay: false,
      currentTab: "commits",
      prMetaData: {
        title: "fix/yep",
        nonce: 12,
        status: "open",
        branch: "fix-update",
        to: "main",
        time: "timestamp here",
        transaction: "pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls",
        author: "martonlederer",
        commits: [],
      },
    };
  },
  methods: {
    attemptedConnect() {
      console.log("PARENT RECEIVED");
      this.connectModalDisplay = true;
    },
  },
  computed: {
    shortenTx() {
      let base = this.prMetaData.transaction;
      const beginning = base.slice(0, 4);
      const end = base.slice(base.length - 4, base.length);
      return `${beginning}...${end}`;
    },
    statusColor() {
      if (this.prMetaData.status === "open") {
        return "is-warning";
      } else {
        return "is-error";
      }
    },
  },
});
</script>

<template>
  <div class="hero">
    <div class="hero-head">
      <div class="container">
        <Navbar @attempt-connect="attemptedConnect()" />
      </div>
    </div>
    <div class="hero-body">
      <div class="container">
        <h1 class="title">
          {{ prMetaData.title }}
          <span style="color: grey">#{{ prMetaData.nonce }}</span>
        </h1>
        <h2 class="subtitle">
          {{ prMetaData.author }} wants to merge
          {{ prMetaData.commits.length }} commits from
          <code>{{ prMetaData.branch }}</code> into
          <code>{{ prMetaData.to }}</code>
        </h2>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-7">
          <div class="tabs">
            <ul>
              <li :class="currentTab === 'commits' ? 'is-active' : ''">
                <a @click="currentTab = 'commits'">Commits</a>
              </li>
              <li :class="currentTab === 'votes' ? 'is-active' : ''">
                <a @click="currentTab = 'votes'"
                  >Votes&nbsp;&nbsp;<span
                    class="tag is-light"
                    :class="statusColor"
                    >{{ prMetaData.status }}</span
                  ></a
                >
              </li>
              <li><a>Files Changed</a></li>
            </ul>
          </div>
          <CommitList
            :branch="prMetaData.branch"
            v-if="currentTab === 'commits'"
          />
          <Votes v-if="currentTab === 'votes'" />
        </div>
        <div class="column is-5">
          <nav class="panel">
            <div class="panel-block">
              <b>Proposer</b>: {{ prMetaData.author }}
            </div>
            <a class="panel-block"> <b>Transaction</b>: {{ shortenTx }} </a>
            <a href="" class="panel-block">
              <b>Submitted</b>: {{ prMetaData.time }}
            </a>
          </nav>
          <div class="box">
            <p class="title is-6">Contributors</p>
            <div class="columns is-multiline">
              <div class="column is-1">
                <figure class="image is-32x32">
                  <img
                    class="is-rounded"
                    src="https://bulma.io/images/placeholders/128x128.png"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="connectModalDisplay">
    <Connect @cancel-connect="connectModalDisplay = false" />
  </div>
</template>

<style scoped>
.tabs {
  border-bottom: 1px solid #dbdbdb;
}
</style>
