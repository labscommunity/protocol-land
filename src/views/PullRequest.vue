<script lang="ts">
import Navbar from "../components/Navbar.vue";
import CommitList from "../components/CommitList.vue";
import Votes from "../components/Votes.vue";
import FileDiff from "../components/FileDiff.vue";
import PullRequestMetadata from "../components/PullRequestMetadata.vue";
import PullRequestFileTree from "../components/PullRequestFileTree.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Navbar,
    CommitList,
    Votes,
    FileDiff,
    PullRequestMetadata,
    PullRequestFileTree,
  },
  data() {
    return {
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
        <Navbar />
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
        <div class="column is-8">
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
              <li :class="currentTab === 'files' ? 'is-active' : ''">
                <a @click="currentTab = 'files'">Files Changed</a>
              </li>
            </ul>
          </div>
          <CommitList
            :branch="prMetaData.branch"
            v-if="currentTab === 'commits'"
          />
          <Votes v-if="currentTab === 'votes'" />
          <FileDiff
            v-if="currentTab === 'files'"
            :to="prMetaData.to"
            :from="prMetaData.branch"
            :bread-crumb="[
              { fileName: 'root', fileHash: 'abc' },
              { fileName: 'src', fileHash: 'xyz' },
              { fileName: 'index.html', fileHash: '123' },
            ]"
          />
        </div>
        <div class="column is-4">
          <div v-if="currentTab === 'files'">
            <PullRequestFileTree branch-id="abc1234" />
          </div>
          <div v-else>
            <PullRequestMetadata
              :proposer="prMetaData.author"
              :date-proposed="prMetaData.time"
              :tx-id="prMetaData.transaction"
              :status="prMetaData.status"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  border-bottom: 1px solid #dbdbdb;
}
</style>
