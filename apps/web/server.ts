import pkg from "@next/env";
import { createServer } from "http";
import next from "next";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { parse } from "url";
import logger from "./src/lib/logger.js";

const { loadEnvConfig } = pkg;
loadEnvConfig(path.resolve(process.cwd(), "../.."), true);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
  });

  (global as any).io = io;

  io.on("connection", (socket) => {
    logger.info("Un cliente se ha conectado");
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    logger.info(`Servidor listo en http://localhost:${PORT}`);
  });
});
