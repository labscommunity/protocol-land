<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "../components/Navbar.vue";
import { dispatchTransaction } from "../utils/signAndPost";
import { CONTRACT_SRC } from "../utils/settings";

export default defineComponent({
  components: {
    Navbar,
  },
  data() {
    return {
      repoName: "",
      repoDesc: "",
      repoZip: "",
      fileText: "",
      loading: false,
    };
  },
  methods: {
    async receiveFiles(event: any) {
      const file = event.target.files[0];
      if (file.type !== "application/zip") {
        // Throw error here
        console.log("This a bad file");
      }
      this.fileText = file.name;
      this.repoZip = file;
    },
    async createNewRepo() {
      const tags = [
        {
          name: "App-Name",
          value: "SmartWeave",
        },
        {
          name: "App-Version",
          value: "0.3.0",
        },
        {
          name: "SDK",
          value: "Warp",
        },
        {
          name: "Contract-Src",
          value: CONTRACT_SRC,
        },
        {
          name: "Repository-Name",
          value: this.repoName,
        },
        {
          name: "Repository-Desc",
          value: this.repoDesc,
        },
        {
          name: "Content-Type",
          value: "application/zip",
        },
        {
          name: "Init-State",
          value: JSON.stringify({
            branches: [],
            pullRequests: [],
          }),
        },
        {
          name: "Protocol",
          value: "ProtocolLand",
        },
      ];

      const result = await dispatchTransaction(this.repoZip, tags);
      if (result.success) {
        this.$router.push(`/r/${result.id}`);
      } else {
        // TODO: THROW ERROR HERE
      }
    },
  },
});
</script>

<template>
  <div class="hero is-medium">
    <div class="hero-head">
      <div class="container">
        <Navbar />
      </div>
    </div>
    <div class="hero-body">
      <div class="container is-max-fullscreen">
        <h1 class="title">Create a repository</h1>
        <div class="columns">
          <div class="column is-half">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="Repository name"
                  v-bind="repoName"
                />
              </div>
            </div>
            <div class="field">
              <label class="label">Description</label>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="Repository name"
                  v-bind="repoDesc"
                />
              </div>
            </div>
            <div class="field">
              <label class="label">Zipped project folder</label>
              <div
                class="file is-fullwidth"
                :class="fileText !== '' ? 'has-name' : ''"
              >
                <label class="file-label">
                  <input
                    class="file-input"
                    @change="receiveFiles"
                    type="file"
                    name="repo"
                  />
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">Choose a file…</span>
                  </span>
                  <span class="file-name" v-if="fileText !== ''">
                    {{ fileText }}
                  </span>
                </label>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button
                  @click="createNewRepo"
                  class="button is-info"
                  :class="loading ? 'is-loading' : ''"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
          <div class="column is-half">
            <div class="content">
              <p>Info here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
