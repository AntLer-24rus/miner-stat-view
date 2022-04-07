import io from "socket.io-client";

import config from "./config.mjs";
import { logger } from "./logger.mjs";
import { Watcher } from "./stdinWatcher.mjs";
import { getInfo, getMinerId } from "./info.mjs";

const watcher = new Watcher();

const ioClient = io(`ws://${config.get("host")}:${config.get("port")}`, {
  path: "/ws",
  transports: ["websocket", "polling"],
  extraHeaders: {
    "x-client-id": getMinerId(),
    "x-client-type": "miner",
  },
});

watcher.on("data", (data) => {
  logger.debug("Send to server stats");
  ioClient.emit("stat", data);
});

ioClient.on("connect", () => {
  ioClient.emit("info", getInfo());
  watcher.watch();
  logger.info("Connected to server");
});
ioClient.on("disconnect", () => {
  logger.info("Disconnected from server");
});
ioClient.on("reconnecting", () => {
  logger.info("Reconnecting to server...");
});
ioClient.on("reconnect", () => {
  logger.info("Reconnected to server");
});

logger.info("Agent started");
