import { networkInterfaces } from "node:os";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

import config from "./config.mjs";
export const getPoolFromConfig = () => {
  try {
    const configMiner = readFileSync(config.get("miner-conf-path"), {
      encoding: "utf8",
    });
    const user = configMiner.match(/^pool.user_name=(.+)$/im)[1];
    const host = configMiner.match(/^pool.host_name=(.+)$/im)[1];
    const port = configMiner.match(/^pool.port=(.+)$/im)[1];
    return `${user}@${host}:${port}`;
  } catch (e) {
    return "";
  }
};

export function getInfo(onlyPool = false) {
  if (onlyPool) {
    return getPoolFromConfig();
  } else {
    const { address: ip, mac } = networkInterfaces().eth0.filter(
      (i) => i.family === "IPv4"
    )[0];
    return { ip, mac, pool: getPoolFromConfig() };
  }
}

export const getMinerId = () => {
  const { mac, pool } = getInfo();
  return crypto
    .createHash("sha256")
    .update(pool + "salt" + mac)
    .digest("hex");
};
