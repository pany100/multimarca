import { ListPresupuestoUseCase } from "@/core/application/use-cases/presupuesto/list-presupuesto.use-case";
import { PrismaPresupuestoRepository } from "@/core/infrastructure/database/repositories/prisma-presupuesto.repository";
import { listPresupuestoQuerySchema } from "@/core/infrastructure/validation/schemas/presupuesto.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { EstadoPresupuesto as EstadoPresupuestoType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page") || "0",
        size: searchParams.get("pageSize") || searchParams.get("size") || "10",
        query: searchParams.get("query") || "",
        estado: searchParams.get("estado") as EstadoPresupuestoType | null,
        sortBy: searchParams.get("sortBy") || "fecha",
        sortOrder: searchParams.get("sortOrder") || "desc",
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      },
      listPresupuestoQuerySchema
    );
    const result = await new ListPresupuestoUseCase(
      new PrismaPresupuestoRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
