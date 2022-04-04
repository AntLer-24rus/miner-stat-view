import fastify from "fastify";
import fastifyIO from "fastify-socket.io";

const HOST = "localhost";
const PORT = 3000;

const WEB_CLIENTS_ROOM = "client_room";
const MINER_CLIENTS_ROOM = "miner_room";

const knownMiners = new Map();

const server = fastify({
  logger: true,
});

server.register(fastifyIO, {
  path: "/ws",
});

server.ready().then(() => {
  server.io.on("connection", (socket) => {
    const { "x-client-type": clientType, "x-client-id": clientId } =
      socket.handshake.headers;

    server.log.debug(
      `Connecting new client "${clientType}" with id: ${clientId} - ${socket.id}`
    );

    if (clientType === "miner") {
      socket.join(MINER_CLIENTS_ROOM);

      socket.on("info", (data) => {
        knownMiners.set(clientId, { online: true, info: data });

        server.io.in(WEB_CLIENTS_ROOM).emit("info", data);
        server.log.debug(
          `Client info: ${clientId}  - ${socket.id} ${JSON.stringify(data)}`
        );
      });
      socket.on("stat", (data) => {
        knownMiners.set(clientId, {
          ...knownMiners.get(clientId),
          online: true,
        });

        server.io.in(WEB_CLIENTS_ROOM).emit("stat", data);
        server.log.debug(`Client stat: ${clientId} ${JSON.stringify(data)}`);
      });
      socket.on("disconnect", () => {
        knownMiners.set(clientId, {
          ...knownMiners.get(clientId),
          online: false,
        });

        server.log.debug(`Client disconnection: ${clientId}`);
      });
    } else if (clientType === "web") {
    } else {
      socket.disconnect(true);
    }
  });
});

server.listen(PORT, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
