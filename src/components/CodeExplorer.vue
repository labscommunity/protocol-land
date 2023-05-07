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
  },
  props: {
    id: String,
    branch: String,
  },
  data() {
    return {
      unzipped: null,
      currentlySelectedFile: "",
      currentDirectory: null,
      previousDirectory: null,
      fileTree: [],
      coolList: [],
      zip: new JSZip(),
    };
  },
  methods: {
    async unZip() {
      // Fetch repo zip
      const zipFolder = await fetch(`https://arweave.net/${this.id}`);
      const blobZip = await zipFolder.blob();

      // @ts-expect-error
      this.unzipped = await this.zip.loadAsync(blobZip);
    },
    async viewFile(path: string) {
      // this.currentDirectory = path;

      if (this.currentDirectory)
        // @ts-expect-error
        this.currentlySelectedFile = await this.unzipped[path].async("string");
    },
    generateFileTree() {
      let result: any[] = [];
      let level = { result };

      console.log(this.zip);
      // @ts-expect-error
      this.unzipped.forEach((path) => {
        path.split("/").reduce((r: any, name: string) => {
          if (!r[name]) {
            r[name] = { result: [] };
            r.result.push({
              path,
              name,
              dir: this.zip.file(path)?.dir,
              children: r[name].result,
            });
          }

          return r[name];
        }, level);
      });

      console.log(result);
      this.fileTree = result[0];

      // this.unzipped.forEach((path) => {
      //   this.coolList.push(path);
      // });

      // const result = this.buildTree();
      // // this.fileTree = result.children;
      // console.log(JSON.stringify(result, undefined, 2));
    },
    // getFilename(path: any) {
    //   console.log(path);
    //     return path.split("/").filter(function(value) {
    //         return value && value.length;
    //     }).reverse()[0];
    // },
    // findSubPaths(path: string) {
    //   // slashes need to be escaped when part of a regexp
    //   var rePath = path.replace("/", "\\/");
    //   var re = new RegExp("^" + rePath + "[^\\/]*\\/?$");
    //   return this.coolList.filter(function(i) {
    //       return i !== path && re.test(i);
    //   });
    // },
    // buildTree(path?: string) {
    //   console.log("Called");
    //   path = path || "";
    //   let nodeList: any = [];
    //   let nested = this;
    //   this.findSubPaths(path).forEach(function(subPath: string) {
    //       let nodeName = nested.getFilename(subPath);
    //       if (/\/$/.test(subPath)) {
    //           var node = {};
    //           // @ts-expect-error
    //           node[nodeName] = nested.buildTree(subPath);
    //           nodeList.push(node);
    //       } else {
    //           nodeList.push(nodeName);
    //       }
    //   });
    //   return nodeList;
    // }
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
        {{ currentDirectory }}
      </span>
    </p>
    <a v-for="file in fileTree.children" class="panel-block">
      <span class="panel-icon">
        <Icon>
          <Folder />
        </Icon>
      </span>
      {{ file.name }}
    </a>
  </nav>

  {{ currentlySelectedFile }}
</template>

<style scoped>
#currentDirectoryHeading .icon {
  margin-right: 10px;
}

#currentDirectoryHeading #text {
  vertical-align: top;
}
</style>
