import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import PullRequest from "./views/PullRequest.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/pr",
      component: PullRequest,
    },
  ],
});
