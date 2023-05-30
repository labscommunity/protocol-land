<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "../components/Navbar.vue";
import CreateCommit from "../components/CreateCommit.vue";
import CodeExplorer from "../components/CodeExplorer.vue";
import { Icon } from "@vicons/utils";
import {
  Add,
  Copy,
  GitBranch,
  GitNetwork,
  GitCommit,
  CodeSlash,
  GitPullRequest,
  Information,
} from "@vicons/ionicons5";
import Arweave from "arweave";
import { readContractState } from 'permawebjs/contract';

export default defineComponent({
  components: {
    Navbar,
    CreateCommit,
    CodeExplorer,
    Icon,
    Add,
    Copy,
    GitBranch,
    GitNetwork,
    GitCommit,
    CodeSlash,
    GitPullRequest,
    Information,
  },
  data() {
    return {
      owner: "martonlederer",
      repoName: "Loading...",
      currentBranch: "TESTBRANCHIDHERE",
      currentTab: "code",
      currentState: [],
      arweave: Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
      })
    };
  },
  computed: {
    repoId() {
      const loc = this.$route.params.id;

      if (typeof loc === "string") return loc;
      return loc[0];
    }
  },
  methods: {
    async getRepoName() {
      const res = await this.arweave.transactions.get(this.repoId);
      res['tags'].forEach(tag => {
        let key = tag.get('name', {decode: true, string: true});
        let value = tag.get('value', {decode: true, string: true});
        
        if (key === "Repository-Name") {
          this.repoName = value;
        }
      });
    },
    async getRepoState() {
      const readResult = await readContractState({
        environment: 'mainnet',
        contractTxId: this.repoId,
      });
      console.log(readResult);
    }
  },
  async mounted() {
    this.getRepoName();
    this.getRepoState();
  }
});
</script>

<template>
  <div class="container">
    <Navbar />
  </div>
  <div class="section">
    <div class="container">
      <h1 class="title has-text-centered is-4">{{ owner }} / {{ repoName }}</h1>
      <div class="tabs is-centered">
        <ul>
          <li :class="currentTab === 'code' ? 'is-active' : ''">
            <a @click="currentTab = 'code'"
              ><span class="icon">
                <Icon>
                  <CodeSlash />
                </Icon>
              </span>
              <span> Code </span></a
            >
          </li>
          <li :class="currentTab === 'pr' ? 'is-active' : ''">
            <a @click="currentTab = 'pr'"
              ><span class="icon">
                <Icon>
                  <GitPullRequest />
                </Icon>
              </span>
              <span>Pull Requests</span></a
            >
          </li>
          <li :class="currentTab === 'commit' ? 'is-active' : ''">
            <a @click="currentTab = 'commit'">
              <span class="icon">
                <Icon>
                  <GitCommit />
                </Icon>
              </span>
              <span> Commit </span></a
            >
          </li>
        </ul>
      </div>
      <div v-if="currentTab === 'code'">
        <CodeExplorer :id="repoId" />
      </div>
      <div v-else-if="currentTab === 'commit'">
        <CreateCommit :repository="repoId" :branch="currentBranch" />
      </div>
    </div>
  </div>
</template>

<style></style>
