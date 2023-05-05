<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "../components/Navbar.vue";
import CreateCommit from "../components/CreateCommit.vue";
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

export default defineComponent({
  components: {
    Navbar,
    CreateCommit,
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
      repoName: "arconnect",
      repoId: "TESTREPOIDHERE",
      currentBranch: "TESTBRANCHIDHERE",
      currentTab: "code",
    };
  },
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
        <nav class="level">
          <!-- Left side -->
          <div class="level-left">
            <div class="level-item">
              <div class="field has-addons">
                <div class="control has-icons-left">
                  <div class="select">
                    <select>
                      <option>main</option>
                      <option>dev</option>
                    </select>
                  </div>
                  <div class="icon is-small is-left">
                    <Icon>
                      <GitBranch />
                    </Icon>
                  </div>
                </div>
                <p class="control">
                  <button class="button">
                    <span class="icon is-small">
                      <Icon>
                        <Add />
                      </Icon>
                    </span>
                  </button>
                </p>
              </div>
            </div>
          </div>

          <!-- Right side -->
          <div class="level-right">
            <p class="level-item"><a>107 Commits</a></p>
            <div class="level-item">
              <div class="field has-addons">
                <p class="control">
                  <a class="button is-success">
                    <span class="icon is-small">
                      <Icon>
                        <Copy />
                      </Icon>
                    </span>
                    <span>Clone</span>
                  </a>
                </p>
                <p class="control">
                  <button class="button is-light">
                    <span class="icon is-small">
                      <Icon>
                        <GitNetwork />
                      </Icon>
                    </span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div v-else-if="currentTab === 'commit'">
        <CreateCommit :repository="repoId" :branch="currentBranch" />
      </div>
    </div>
  </div>
</template>

<style></style>
