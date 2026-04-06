import logger from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(err: unknown) {
  if (err === null || err === undefined) {
    logger.error("Null or undefined error caught", {
      error: "Error object was null or undefined",
    });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma: unique constraint violation
    if (err.code === "P2002") {
      const target = (err.meta as any)?.target;
      const targetText = Array.isArray(target) ? target.join(",") : String(target ?? "");

      // Caso específico: Stock.label es unique
      if (targetText.includes("label") || targetText.includes("Stock_label_key")) {
        return NextResponse.json(
          { error: "Ya existe un stock con ese rótulo" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Ya existe un registro con esos datos únicos" },
        { status: 409 }
      );
    }
  }

  if (err instanceof ZodError) {
    logger.warn("Validación fallida", {
      errors: err.flatten(),
    });
    return NextResponse.json(
      { error: "Validación fallida", details: err.flatten() },
      { status: 422 }
    );
  }

  const message = err instanceof Error ? err.message : "Error interno";
  const status = message.includes("no encontrado") ? 404 : 400;

  if (err instanceof Error) {
    logger.error("Error en API", {
      message: err.message,
      stack: err.stack,
      status,
    });
  } else {
    logger.error("Error desconocido en API", {
      error: err,
      status,
    });
  }

  return NextResponse.json({ error: message }, { status });
}
