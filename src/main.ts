import { createApp } from "vue";
import App from "./App.vue";
import "../node_modules/bulma/css/bulma.min.css";
import router from "./router";
// @ts-expect-error
import CodeDiff from "v-code-diff";

createApp(App).use(router).use(CodeDiff).mount("#app");
