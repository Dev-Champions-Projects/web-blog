import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";

const hostname = "localhost";

const port = process.env.PORT || 3000;

const app = next({
  dev,
  hostname,
  port,
});

const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  /*
   * Make the Socket.IO instance available
   * to Next server actions/API handlers.
   */

  globalThis.techPathIO = io;

  io.on(
    "connection",

    (socket) => {
      /*
       * Every authenticated user gets
       * their own Socket.IO room.
       *
       * Multiple browser tabs/devices can
       * therefore receive the same event.
       */

      socket.on(
        "addOnlineUser",

        (userId) => {
          if (typeof userId !== "string" || !userId) {
            return;
          }

          socket.join(`user:${userId}`);
        },
      );

      /*
       * Preserve compatibility with your
       * current client-side social
       * notification calls.
       */

      socket.on(
        "onNotification",

        (recipientId) => {
          if (typeof recipientId !== "string" || !recipientId) {
            return;
          }

          io.to(`user:${recipientId}`).emit("getNotifications");
        },
      );

      socket.on(
        "disconnect",

        () => {
          // Socket.IO automatically
          // removes room membership.
        },
      );
    },
  );

  httpServer
    .once(
      "error",

      (error) => {
        console.error(error);

        process.exit(1);
      },
    )
    .listen(
      port,

      () => {
        console.log(`>> Tech Path ready on port ${port}`);
      },
    );
});
