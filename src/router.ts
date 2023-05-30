import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import PullRequest from "./views/PullRequest.vue";
import Repository from "./views/Repository.vue";
import Create from "./views/Create.vue";

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
    {
      path: "/r/:id(.*)*",
      component: Repository,
    },
    {
      path: "/create",
      component: Create,
    },
  ],
});
