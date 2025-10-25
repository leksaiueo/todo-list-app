import { createRouter, createWebHistory } from "vue-router";

import dashboard from "../pages/dashboard.vue";
import kanban from "../pages/kanban.vue";
const routes = [
  {
    name: "dashboard",
    path: "/",
    component: dashboard,
  },
  {
    name: "kanban",
    path: "/kanban",
    component: kanban,
  },
];

const router = Router();
export default router;
function Router() {
  const router = new createRouter({
    history: createWebHistory(),
    routes,
  });
  return router;
}
