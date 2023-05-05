<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@vicons/utils";
import { Balloon, GitBranch, GitCommit } from "@vicons/ionicons5";
import { dispatchTransaction } from "../utils/signAndPost";
import ConfettiExplosion from "vue-confetti-explosion";

export default defineComponent({
  components: {
    Icon,
    Balloon,
    GitBranch,
    GitCommit,
    ConfettiExplosion,
  },
  props: {
    repository: String,
    branch: String,
  },
  data() {
    return {
      currentFile: Object,
      fileText: "",
      commitMessage: "",
      commitId: "",
      processingCommit: false,
      committed: false,
    };
  },
  methods: {
    async receiveFiles(event: any) {
      const file = event.target.files[0];
      this.fileText = file.name;
      this.currentFile = file;
    },
    async uploadToArweave() {
      this.processingCommit = true;
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
          name: "Contract",
          value: this.repository,
        },
        {
          name: "Input",
          value: JSON.stringify({
            function: "commit",
            input: { branch: this.branch },
          }),
        },
        {
          name: "Protocol",
          value: "ProtocolLand",
        },
      ];

      const result = await dispatchTransaction(this.currentFile, tags);
      if (result.success) {
        // @ts-expect-error
        this.commitId = result.id;
        this.processingCommit = false;
      } else {
        console.log(result);
      }
    },
  },
});
</script>

<template>
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
  </div>
  <div class="field">
    <div class="control">
      <div class="file is-centered is-info is-boxed has-name">
        <label class="file-label">
          <input
            @change="receiveFiles"
            class="file-input"
            type="file"
            name="repo zip"
          />
          <span class="file-cta">
            <span class="file-icon">
              <Icon>
                <Balloon />
              </Icon>
            </span>
            <span class="file-label">Upload Folder</span>
          </span>
          <span v-if="fileText !== ''" class="file-name">{{ fileText }}</span>
        </label>
      </div>
    </div>
  </div>
  <div class="field has-addons-centered has-addons">
    <div class="control">
      <input
        v-bind="commitMessage"
        class="input is-light"
        type="text"
        placeholder="Commit message"
      />
    </div>
    <div class="control">
      <button
        @click="uploadToArweave"
        :class="processingCommit ? 'is-loading' : ''"
        class="button is-success is-light"
      >
        <span v-if="commitId !== ''">
          <ConfettiExplosion :height="500" />
        </span>
        <span class="icon">
          <Icon>
            <GitCommit />
          </Icon>
        </span>
        <span> Commit </span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
