import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyStatic from "fastify-static";
import { fileURLToPath, URL } from "url";

import config from "./config.mjs";

const WEB_CLIENTS_ROOM = "client_room";
const MINER_CLIENTS_ROOM = "miner_room";

const server = fastify({
  logger: {
    level: config.get("dev") ? "debug" : "info",
    prettyPrint: config.get("dev")
      ? {
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        }
      : false,
  },
});

server.register(fastifyIO, {
  path: "/ws",
});
server.register(fastifyStatic, {
  root: fileURLToPath(new URL("./public", import.meta.url)),
});

server.ready().then(() => {
  const knownMiners = new Map();

  const flatMap = (map) => Array.from(map, ([id, value]) => ({ id, ...value }));

  server.io.on("connection", (socket) => {
    const client = {
      id: socket.handshake.headers["x-client-id"],
      type: socket.handshake.headers["x-client-type"],
    };

    if (!client.id || !client.type) {
      socket.disconnect();
      server.log.debug(
        `Disconnected client ${JSON.stringify(client)} with unknown type or id`
      );
      return;
    }

    const joinMiner = (data) => {
      knownMiners.set(client.id, {
        ...knownMiners.get(client.id),
        online: true,
        ...data,
      });
      socket.join(MINER_CLIENTS_ROOM);
      server.io.in(WEB_CLIENTS_ROOM).emit("miner-list", flatMap(knownMiners));
    };
    const leaveMiner = () => {
      knownMiners.set(client.id, {
        ...knownMiners.get(client.id),
        online: false,
      });
      server.io.in(WEB_CLIENTS_ROOM).emit("miner-list", flatMap(knownMiners));
    };

    const updateMinerData = (data) => {
      knownMiners.set(client.id, {
        ...knownMiners.get(client.id),
        ...data,
      });
      server.io.in(WEB_CLIENTS_ROOM).emit("miner-list", flatMap(knownMiners));
    };

    if (client.type === "miner") {
      socket.on("info", (data) => joinMiner({ info: data }));
      socket.on("stat", (data) => updateMinerData({ stat: data }));
      socket.on("disconnect", () => leaveMiner());
    } else if (client.type === "web") {
      socket.join(WEB_CLIENTS_ROOM);
      socket.emit("miner-list", flatMap(knownMiners));
    }

    server.log.debug(
      `Connecting new client "${client.type}" with id: ${client.id} - ${socket.id}`
    );
    socket.onAny((eventName, ...args) => {
      server.log.debug(
        `Client ${client.type}/${
          client.id
        } emit event ${eventName} with data: ${JSON.stringify(args)}`
      );
    });
  });
});

server.listen(config.get("port"), config.get("host"), (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
