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
      unzipped: null,
      currentlySelectedFile: "",
      currentPath: "/",
      previousPath: "",
      fileTree: [],
      zip: new JSZip(),
      oldZip: new JSZip(),
      testFiles: [],
      unzippedDirs: [],
      currentDir: "/",
      newDir: "",
    };
  },
  methods: {
    async unZip() {
      // Fetch repo zip
      const zipFolder = await fetch(`https://arweave.net/${this.id}`);
      const blobZip = await zipFolder.blob();

      // @ts-expect-error
      this.unzipped = await this.zip.loadAsync(blobZip, {
        createFolders: true,
      });
    },
    async navigateTo(target: any) {
      console.log(`---\nNavigating to: ${target.path}\n---`);
      this.previousPath = this.currentPath;
      this.oldZip = this.zip;
      this.currentPath = target.path;

      if (target.dir === false) {
        console.log("SEtting new file");
        // Is file
        this.currentlySelectedFile = await this.zip
          .file(target.path)
          .async("string");
        console.log(this.currentlySelectedFile);
      } else {
        // Is directory
        this.zip = await this.zip.filter(target.path);
        await this.generateFileTree(this.zip);
      }
    },
    async navigateBack() {
      console.log("NAVIGATING BACK...");
      console.log(this.currentPath);

      this.currentPath = this.previousPath;
      this.zip = this.oldZip.folder(new RegExp(this.currentPath));
      console.log(this.zip);
      await this.generateFileTree(this.zip);
    },
    generateFileTree(zipInstance: any) {
      let result: any[] = [];
      let level = { result };

      // console.log(this.zip);
      // @ts-expect-error
      zipInstance.forEach((path) => {
        console.log(
          `---\n${zipInstance.file(path)?.dir}\n\n${
            zipInstance.file(path)?.unsafeOriginalName
          }\n${zipInstance.file(path)?.name}\n---`
        );
        path.split("/").reduce((r: any, name: string) => {
          if (!r[name]) {
            r[name] = { result: [] };
            r.result.push({
              path,
              name,
              dir: zipInstance.file(path)?.dir,
              children: r[name].result,
            });
          }

          return r[name];
        }, level);
      });

      console.log("CURRENT FILE TREE");
      console.log(result);
      const depthCount = (result[0].path.match(/\//g) || []).length;
      if (depthCount > 1) {
        this.fileTree = result;
      } else {
        this.previousPath = result[0].path;
        this.fileTree = result[0];
      }
    },
    generateTestFileTree() {
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

      // Convert the set of directories back to an array and add it to the component's data
      this.currentDir = "";
    },
    changeDir(newDir) {
      this.currentDir = newDir;
    },
    goBack() {
      if (this.currentDir === "/") {
        return;
      }
      // Remove the last directory from the current directory path
      const newDir = this.currentDir.split("/").slice(0, -1).join("/");
      this.currentDir = newDir;
    },
    isDirAtCurrentLevel(path) {
      const currentPath = this.currentDir === "/" ? "" : this.currentDir;
      return (
        path.startsWith(currentPath) &&
        path.split("/").length === currentPath.split("/").length + 1
      );
    },
    isDirSelected(path) {
      const currentPath = this.currentDir === "/" ? "" : this.currentDir;
      return path === currentPath;
    },
    getDirName(path) {
      return path.split("/").pop();
    },
    getFileName(file: string) {
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
  },
  async mounted() {
    await this.unZip();
    await this.generateTestFileTree();
    // await this.generateFileTree(this.unzipped);
    // await this.generateTestFileTree(this.unzipped);
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
        {{ currentDir }}
      </span>
    </p>
    <!-- <span v-for="file in fileTree.children">
      <a v-if="file.name !== ''" @click="navigateTo(file)" class="panel-block">
        <span class="panel-icon">
          <Icon>
            <Folder />
          </Icon>
        </span>
        {{ file.name }}
      </a>
      <a v-else @click="navigateBack" class="panel-block">
        <span class="panel-icon">
          <Icon>
            <ReturnUpBack />
          </Icon>
        </span>
      </a>
    </span> -->

    <a v-if="currentDir" @click="goBack" class="panel-block">
      <span class="panel-icon">
        <Icon>
          <ReturnUpBack />
        </Icon>
      </span>
    </a>
    <span v-for="(dir, index) in dirsAtCurrentLevel" :key="index">
      <a
        class="panel-block"
        @click="changeDir(dir)"
        v-if="dir.startsWith(currentDir)"
      >
        <span class="panel-icon">
          <Icon>
            <Folder />
          </Icon>
        </span>
        {{ getDirName(dir) }}
      </a>
    </span>
    <span v-for="(file, index) in filesAtCurrentLevel" :key="index">
      <a class="panel-block" v-if="file.startsWith(currentDir)">
        <span class="panel-icon">
          <Icon>
            <Book />
          </Icon>
        </span>
        {{ getFileName(file) }}
      </a>
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
