import { CreatePrestamoHerramientasUseCase } from "@/core/application/use-cases/prestamo-herramientas/create-prestamo-herramientas.use-case";
import { PrismaPrestamoHerramientasRepository } from "@/core/infrastructure/database/repositories/prisma-prestamo-herramientas.repository";
import { createPrestamoHerramientasSchema } from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    let whereClause: any = {};

    if (query) {
      const queryNum = parseInt(query);
      whereClause = {
        OR: [
          ...(queryNum ? [{ id: queryNum }] : []),
          { nombre: { contains: query } },
          { herramienta: { contains: query } },
        ],
      };
    }

    const [prestamos, total] = await Promise.all([
      (prisma as any).prestamoHerramientas.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
      }),
      (prisma as any).prestamoHerramientas.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: prestamos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener préstamos de herramientas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
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
