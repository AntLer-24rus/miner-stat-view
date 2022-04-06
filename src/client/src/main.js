import { createApp } from "vue";
import App from "./App.vue";

import { createSocket } from "./plugins/socket-io";

import "@/styles/index.scss";

createApp(App)
  .use(
    createSocket({
      path: "/ws/",
      // transports: ["polling", "websocket"],
      extraHeaders: {
        "x-client-id": "1",
        "x-client-type": "web",
      },
    })
  )
  .mount("#app");
