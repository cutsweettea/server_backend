import { createServer } from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./types.ts";
import conf from "../config.ts";
import { type Application } from "express";
import Database from "../db/database.ts";

export default class SocketServer {
  private app: Application;
  private db: Database;
  private srm: Record<string, string>;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(app: Application, db: Database) {
    this.app = app;
    this.db = db;
    this.srm = {};

    const httpServer = createServer(this.app);
    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(
      httpServer,
      {
        cors: {
          origin: conf.prod ? "https://divine.frl" : "http://localhost:5173",
          methods: ["GET", "POST"],
        },
      },
    );

    this.io.use(async (socket, next) => {
      const ref = socket.handshake.auth?.ref;
      if (!ref) {
        console.log(`missing ref`);
        return next(new Error("missing ref"));
      }

      let actual_ref;
      try {
        actual_ref = await this.db.getDiscord().getRef(ref);
      } catch (e) {
        console.log(e);
        return next(new Error("invalid ref"));
      }

      socket.data.ref = actual_ref.id;
      next();
    });

    this.io.on("connection", (socket) => {
      console.log(`user connected: ${socket.id}, ${socket.data.ref}`);
      this.srm[socket.data.ref] = socket.id;
      /*socket.on("sendMessage", (message: string) => {
        console.log(`received message: ${message}`);
        io.emit("receiveMessage", message);
        });*/

      socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`);
      });
    });

    httpServer.listen(conf.port, () => {
      console.log(`listening on port ${conf.port}`);
    });
  }

  public getIO() {
    return this.io;
  }

  public getSRM() {
    return this.srm;
  }
}
