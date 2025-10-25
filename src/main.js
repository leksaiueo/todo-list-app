import { createApp } from "vue";
import App from "./App.vue";

//import css
import "./style.css";

//import router
import router from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");
