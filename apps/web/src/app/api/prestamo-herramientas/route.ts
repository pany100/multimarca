import { CreatePrestamoHerramientasUseCase } from "@/core/application/use-cases/prestamo-herramientas/create-prestamo-herramientas.use-case";
import { ListPrestamoHerramientasUseCase } from "@/core/application/use-cases/prestamo-herramientas/list-prestamo-herramientas.use-case";
import { PrismaPrestamoHerramientasRepository } from "@/core/infrastructure/database/repositories/prisma-prestamo-herramientas.repository";
import { createPrestamoHerramientasSchema } from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaPrestamoHerramientasRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await new ListPrestamoHerramientasUseCase(
      buildRepo()
    ).execute({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      query: searchParams.get("query"),
    });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createPrestamoHerramientasSchema);
    const result = await new CreatePrestamoHerramientasUseCase(
      new PrismaPrestamoHerramientasRepository()
    ).execute({
      ...dto,
      devuelto: dto.devuelto ?? false,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
