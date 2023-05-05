<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@vicons/utils";
import { Balloon, GitBranch, GitCommit } from "@vicons/ionicons5";

export default defineComponent({
  components: {
    Icon,
    Balloon,
    GitBranch,
    GitCommit,
  },
  props: {
    repository: String,
    branch: String,
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
      <div class="file is-centered is-boxed has-name">
    <label class="file-label">
      <input class="file-input" type="file" name="resume" />
      <span class="file-cta">
        <span class="file-icon">
          <Icon>
            <Balloon />
          </Icon>
        </span>
        <span class="file-label"> Upload Folder </span>
      </span>
      <span class="file-name"> Screen Shot 2017-07-29 at 15.54.25.png </span>
    </label>
  </div>
    </div>
  </div>
  <div class="field has-addons-centered has-addons">
    <div class="control">
      <input class="input is-light" type="text" placeholder="Commit message">
    </div>
    <div class="control">
    <a class="button is-success is-light">
      <span class="icon">
        <Icon>
          <GitCommit />
        </Icon>
      </span>
      <span>
        Commit
      </span>
    </a>
  </div>
  </div>

  <p>Repo: {{ repository }}</p>
  <p>Branch: {{ branch }}</p>
</template>

<style scoped></style>
