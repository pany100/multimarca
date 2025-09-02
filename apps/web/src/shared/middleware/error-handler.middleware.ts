import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validación fallida", details: err.flatten() },
      { status: 422 }
    );
  }
  const message = err instanceof Error ? err.message : "Error interno";
  const status = message.includes("no encontrado") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
