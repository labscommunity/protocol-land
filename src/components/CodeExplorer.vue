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
  ReturnUpBack
} from "@vicons/ionicons5";
// import { component as VueCodeHighlight } from 'vue-code-highlight';
import { HighCode } from 'vue-highlight-code';
import 'vue-highlight-code/dist/style.css';
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
    HighCode
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
      testFileTree: []
    };
  },
  methods: {
    async unZip() {
      // Fetch repo zip
      const zipFolder = await fetch(`https://arweave.net/${this.id}`);
      const blobZip = await zipFolder.blob();

      // @ts-expect-error
      this.unzipped = await this.zip.loadAsync(blobZip, {createFolders: true});
    },
    async navigateTo(target: any) {
      console.log(`---\nNavigating to: ${target.path}\n---`)
      this.previousPath = this.currentPath;
      this.oldZip = this.zip;
      this.currentPath = target.path;

      if (target.dir === false) {
        // Is file
        this.currentlySelectedFile = await this.zip.file(target.path).async("string");
      } else {
        // Is directory
        this.zip = await this.zip.folder(target.path);
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
        console.log(`---\n${zipInstance.file(path)?.dir}\n\n${zipInstance.file(path)?.unsafeOriginalName}\n${zipInstance.file(path)?.name}\n---`);
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
    generateTestFileTree(zipInstance) {
      console.log(zipInstance);
      for (const file in zipInstance.files) {
        if (zipInstance.hasOwnProperty(file)) {
          console.log(`${file}`);
        }
      }
    }
  },
  async mounted() {
    await this.unZip();
    await this.generateFileTree(this.unzipped);
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
        {{ currentPath }}
      </span>
    </p>
    <span v-for="file in fileTree.children">
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
    </span>
  </nav>

  <div v-if="currentPath.indexOf('.md') > -1">
    // Is markdown

  </div>
  <div v-else>
    <!-- <vue-code-highlight language="javascript">
      <pre>
    {{ currentlySelectedFile }}
    </pre>
</vue-code-highlight> -->

<HighCode
  class="code"
  :codeValue="currentlySelectedFile"
></HighCode>

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
