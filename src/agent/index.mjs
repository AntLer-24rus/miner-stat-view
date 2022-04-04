import { Watcher } from "./stdinWatcher.mjs";
import io from "socket.io-client";

const HOST = "localhost";
const PORT = 3000;

const watcher = new Watcher();

const ioClient = io(`ws://${HOST}:${PORT}`, {
  path: "/ws",
  transports: ["websocket", "polling"],
  extraHeaders: {
    "x-client-id": "FAKE_MINER_ID",
    "x-client-type": "miner",
  },
});

setInterval(() => {
  ioClient.emit("stat", Date.now());
}, 3000);

watcher.on("data", (data) => {
  ioClient.emit("stat", data);
});

ioClient.on("connect", () => {
  ioClient.emit("info", { ip: "0.0.0.0", mac: "00:00:00:00:00:00" });
  // watcher.watch();
  console.log("connected to server");
});
ioClient.on("disconnect", () => {
  console.log("disconnected from server");
});
ioClient.on("reconnecting", () => {
  console.log("reconnecting to server...");
});
ioClient.on("reconnect", () => {
  console.log("reconnected to server");
});
