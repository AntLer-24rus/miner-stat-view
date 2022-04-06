import pino from "pino";

import config from "./config.mjs";

export const logger = pino({
  level: config.get("dev") ? "debug" : "info",
  prettyPrint: config.get("dev")
    ? {
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      }
    : false,
});
