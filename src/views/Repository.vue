<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "../components/Navbar.vue";
import { Icon } from "@vicons/utils";
import {
  Add,
  Copy,
  GitBranch,
  CodeSlash,
  GitPullRequest,
  Information,
} from "@vicons/ionicons5";

export default defineComponent({
  components: {
    Navbar,
    Icon,
    Add,
    Copy,
    GitBranch,
    CodeSlash,
    GitPullRequest,
    Information,
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
            <li class="is-active">
              <a
                ><span class="icon">
                  <Icon>
                    <CodeSlash />
                  </Icon>
                </span>
                <span> Code </span></a
              >
            </li>
            <li>
              <a
                ><span class="icon">
                  <Icon>
                    <GitPullRequest />
                  </Icon>
                </span>
                <span>Pull Requests</span></a
              >
            </li>
            <li>
              <a>
                <span class="icon">
                  <Icon>
                    <Information />
                  </Icon>
                </span>
                <span>
                  Info&nbsp;&nbsp;<span class="tag is-small">Coming soon!</span>
                </span></a
              >
            </li>
          </ul>
        </div>
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
                      <CodeSlash />
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
                        <GitBranch />
                      </Icon>
                    </span>
                  </button>
                </p>
              </div>
            </div>
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
