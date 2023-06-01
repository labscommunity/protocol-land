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
      files: [] as string[],
      dirs: [] as string[],
    };
  },
  methods: {
    async unZip() {
      // Fetch repo zip
      const zipFolder = await fetch(`https://arweave.net/${this.id}`);
      const zip = await this.zip.loadAsync(
        await zipFolder.blob(), {
          createFolders: true,
        }
      );
      const rootDir = Object.keys(zip.files)[0].split("/")[0];

      // strip parent dir
      this.unzipped = zip.folder(rootDir) as JSZip;
    },
    generateFileTree() {
      this.unzipped.forEach((path, file) => {
        if (file.dir) this.dirs.push(path);
        else this.files.push(path);
      });
    },
    getLocalName(path: string) {
      if (path.endsWith("/")) {
        path = path.replace(/\/$/, "");
      }

      return path.split("/").pop();
    }
  },
  computed: {
    path() {
      const loc = this.$route.params.id;

      if (typeof loc === "string") return "/";

      let fullPath = "/" + loc.slice(1, loc.length).join("/");

      if (!fullPath.endsWith("/")) fullPath += "/";

      return fullPath;
    },
    dirsAtCurrentLevel() {
      return this.dirs.filter(
        (dir) => {
          const dirPath = "/" + dir;
          const stripPath = dirPath.replace(new RegExp(`^${this.path}`), "");

          // dir paths end with "/" in jszip
          return stripPath.match(/\//g)?.length === 1;
        }
      );
    },
    filesAtCurrentLevel() {
      return this.files.filter(
        (file) => {
          const filePath = "/" + file;
          const stripPath = filePath.replace(new RegExp(`^${this.path}`), "");

          // file paths don't end with "/"
          return !stripPath.match(/\//g);
        }
      );
    },
    upOneLevel() {
      const levels = this.path.replace(/\/$/, "").split("/")

      return levels.slice(0, levels.length - 1).join("/");
    }
  },
  async mounted() {
    await this.unZip();
    this.generateFileTree();
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
        :to="{ path: `/r/${id}/${dir}` }"
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
        :to="{ path: `/r/${id}/${file}` }"
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
