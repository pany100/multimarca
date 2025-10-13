import { EmpleadoService } from "@/core/application/services/empleados.service";
import { CreateEmpleadosUseCase } from "@/core/application/use-cases/mecanicos/create-empleados.use-case";
import { ListEmpleadosUseCase } from "@/core/application/use-cases/mecanicos/list-empleados.use-case";
import { PrismaEmpleadoRepository } from "@/core/infrastructure/database/repositories/prisma-empleado.repository";
import {
  createMecanicoSchema,
  listMecanicosQuerySchema,
} from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: parseInt(searchParams.get("page") || "0"),
        size: parseInt(searchParams.get("size") || "10"),
        query: searchParams.get("query") || "",
        soloMecanicos: searchParams.get("mecanicos") === "true",
      },
      listMecanicosQuerySchema
    );
    const mecanicos = await new ListEmpleadosUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto);
    return NextResponse.json(mecanicos);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createMecanicoSchema);
    const result = await new CreateEmpleadosUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
