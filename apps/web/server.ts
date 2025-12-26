import pkg from "@next/env";
import { createServer } from "http";
import * as jose from "jose";
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

// Handlers globales de errores no capturados
process.on("uncaughtException", (error: Error) => {
  logger.error("[UNCAUGHT EXCEPTION] Error no capturado en el proceso", {
    error: error.message,
    stack: error.stack,
    name: error.name,
  });
  // En producción, podrías querer reiniciar el proceso aquí
  if (!dev) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("[UNHANDLED REJECTION] Promise rechazada sin catch", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: String(promise),
  });
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);

    // Loggear requests entrantes
    const startTime = Date.now();
    const { method, url } = req;

    // Obtener información del usuario del token JWT
    let userInfo = "visitor";
    const authHeader = req.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (JWT_SECRET) {
          const secretKey = new TextEncoder().encode(JWT_SECRET);
          const { payload } = await jose.jwtVerify(token, secretKey);
          userInfo =
            (payload.email as string) || `ID:${payload.userId}` || "visitor";
        }
      } catch (error) {
        // Token inválido o expirado, mantener "visitor"
      }
    }

    // Interceptar el final de la respuesta para loggear
    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Solo loggear rutas API
      if (url?.startsWith("/api/")) {
        const logMessage = `[API] ${method} ${url} → ${statusCode} | User: ${userInfo} | ${duration}ms`;

        if (statusCode >= 500) {
          logger.error(logMessage);
        } else if (statusCode >= 400) {
          logger.warn(logMessage);
        } else if (statusCode >= 200 && statusCode < 300) {
          logger.info(logMessage);
        }
      }

      return originalEnd(chunk, encoding, callback);
    };

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
