import logger from "@/lib/logger";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(err: unknown) {
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
