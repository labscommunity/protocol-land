<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@vicons/utils";
import {
  Add,
  Copy,
  GitBranch,
  GitNetwork,
  Book,
  Folder,
  ReturnUpBack,
} from "@vicons/ionicons5";
import JSZip from "jszip";

export default defineComponent({
  components: {
    Icon,
    Add,
    Copy,
    GitBranch,
    GitNetwork,
    Book,
    Folder,
    ReturnUpBack,
  },
  props: {
    id: String,
    branch: String,
  },
  data() {
    return {
      unzipped: new JSZip(),
      currentlySelectedFile: "",
      currentPath: "/",
      previousPath: "",
      fileTree: [],
      zip: new JSZip(),
      oldZip: new JSZip(),
      testFiles: [] as string[],
      unzippedDirs: [] as string[],
    };
  },
  methods: {
    async unZip() {
      // Fetch repo zip
      const zipFolder = await fetch(`https://arweave.net/${this.id}`);
      const blobZip = await zipFolder.blob();

      this.unzipped = await this.zip.loadAsync(blobZip, {
        createFolders: true,
      });
    },
    generateFileTree() {
      const zipFiles = this.unzipped.files;

      // Loop through each file in the ZIP folder
      Object.keys(zipFiles).forEach((file) => {  
        const path = file.split("/");

        if (path[1] === "") return;

        // Add the file name to the list of files
        this.testFiles.push(file);
        
        const dir = path.slice(0, path.length - 1).join("/");

        if (!this.unzippedDirs.includes(dir)) {
          this.unzippedDirs.push(dir);
        }
      });
    },
    isDirAtCurrentLevel(path: string) {
      const currentPath = this.path === "/" ? "" : this.path;
      return (
        path.startsWith(currentPath) &&
        path.split("/").length === currentPath.split("/").length + 1
      );
    },
    isDirSelected(path: string) {
      const currentPath = this.path === "/" ? "" : this.path;
      return path === currentPath;
    },
    getLocalName(path: string) {
      return path.split("/").pop();
    },
    getGlobalName(file: string) {
      const pth = file.split("/");

      return pth.slice(1, pth.length).join("/");
    }
  },
  computed: {
    path() {
      const loc = this.$route.params.id;

      if (typeof loc === "string") return "/";

      return "/" + loc.slice(1, loc.length).join("/");
    },
    dirsAtCurrentLevel() {
      const currentPath = this.path === "/" ? "" : this.path;

      return this.unzippedDirs.filter(
        (dir) =>
          dir.startsWith(currentPath) &&
          dir.split("/").length === currentPath.split("/").length + 1
      );
    },
    filesAtCurrentLevel() {
      const currentPath = this.path === "/" ? "" : this.path;

      return this.testFiles.filter(
        (file) =>
          file.startsWith(currentPath) &&
          file.split("/").length === currentPath.split("/").length + 1
      ).map((file) => file.replace(currentPath, ""));
    },
    upOneLevel() {
      const levels = this.path.split("/")

      return levels.slice(0, levels.length - 1).join("/");
    }
  },
  async mounted() {
    await this.unZip();
    await this.generateFileTree();
  },
});
</script>

<template>
  <h2 class="subtitle">
    {{ id }}
  </h2>
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

  <nav class="panel">
    <p class="panel-heading" id="currentDirectoryHeading">
      <span class="icon">
        <Icon>
          <Folder />
        </Icon>
      </span>
      <span id="text">
        {{ path }}
      </span>
    </p>
    <router-link v-if="path !== '/'" class="panel-block" :to="{ path: `/r/${id}${upOneLevel}` }">
      <span class="panel-icon">
        <Icon>
          <ReturnUpBack />
        </Icon>
      </span>
    </router-link>
    <span v-for="(dir, index) in dirsAtCurrentLevel" :key="index">
      <router-link
        :to="{ path: `/r/${id}/${getGlobalName(dir)}` }"
        class="panel-block"
      >
        <span class="panel-icon">
          <Icon>
            <Folder />
          </Icon>
        </span>
        {{ getLocalName(dir) }}
      </router-link>
    </span>
    <span v-for="(file, index) in filesAtCurrentLevel" :key="index">
      <router-link
        :to="{ path: `/r/${id}/${getGlobalName(file)}` }"
        class="panel-block"
      >
        <span class="panel-icon">
          <Icon>
            <Book />
          </Icon>
        </span>
        {{ getLocalName(file) }}
      </router-link>
    </span>
  </nav>

  <div v-if="currentPath.indexOf('.md') > -1">// Is markdown</div>
  <div v-else>
    <pre><code>{{ currentlySelectedFile }}</code></pre>
  </div>
</template>

<style scoped>
#currentDirectoryHeading .icon {
  margin-right: 10px;
}

#currentDirectoryHeading #text {
  vertical-align: top;
}
</style>
