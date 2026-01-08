import pkg from "@next/env";
import { createServer, IncomingMessage } from "http";
import * as jose from "jose";
import next from "next";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { Readable } from "stream";
import { parse } from "url";
import logger from "./src/lib/logger.js";

// Configuración para logging del body
const MAX_BODY_LOG_SIZE = 10 * 1024; // 10KB máximo
const SKIP_BODY_LOG_ROUTES = ["/api/upload", "/api/images"];

// Helper para leer el body y crear un request "restaurado"
async function readBodyAndCloneRequest(
  req: IncomingMessage
): Promise<{ clonedReq: IncomingMessage; body: string }> {
  // Leer el body como string directamente
  let body = "";
  const chunks: string[] = [];

  await new Promise<void>((resolve, reject) => {
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => chunks.push(chunk));
    req.on("end", () => resolve());
    req.on("error", reject);
  });

  body = chunks.join("");
  const bodyBuffer = Buffer.from(body, "utf8");

  // Crear un nuevo Readable stream con el body
  const readable = Readable.from(bodyBuffer);

  // Copiar todas las propiedades del request original al nuevo stream
  const clonedReq = Object.assign(readable, {
    headers: req.headers,
    method: req.method,
    url: req.url,
    httpVersion: req.httpVersion,
    httpVersionMajor: req.httpVersionMajor,
    httpVersionMinor: req.httpVersionMinor,
    socket: req.socket,
    connection: req.connection,
    rawHeaders: req.rawHeaders,
    trailers: req.trailers,
    rawTrailers: req.rawTrailers,
    complete: req.complete,
    aborted: req.aborted,
    statusCode: req.statusCode,
    statusMessage: req.statusMessage,
  }) as IncomingMessage;

  return { clonedReq, body };
}

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

    // Determinar si debemos capturar el body
    const shouldCaptureBody =
      ["POST", "PUT", "PATCH"].includes(method || "") &&
      url?.startsWith("/api/") &&
      !SKIP_BODY_LOG_ROUTES.some((route) => url?.startsWith(route)) &&
      !req.headers["content-type"]?.includes("multipart/form-data");

    // Variables para el logging
    let requestBody = "";
    let requestToHandle: IncomingMessage = req;

    // Capturar body si aplica
    if (shouldCaptureBody) {
      try {
        const { clonedReq, body } = await readBodyAndCloneRequest(req);
        requestToHandle = clonedReq;

        // Formatear body para el log
        try {
          const parsed = JSON.parse(body);
          requestBody = JSON.stringify(parsed);
        } catch {
          requestBody = body;
        }

        // Truncar si es muy largo
        if (requestBody.length > MAX_BODY_LOG_SIZE) {
          requestBody =
            requestBody.substring(0, MAX_BODY_LOG_SIZE) + "... [truncado]";
        }
      } catch (error) {
        logger.warn(`Error capturando body: ${error}`);
      }
    }

    // Obtener información del usuario del token JWT
    let userInfo = "VISITOR";
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
        let logMessage = `[API] ${method} ${url} → ${statusCode} | User: ${userInfo} | ${duration}ms`;

        // Agregar body si existe
        if (requestBody) {
          logMessage += ` | Body: ${requestBody}`;
        }

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

    handle(requestToHandle, res, parsedUrl);
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
