import { CreateSueldoUseCase } from "@/core/application/use-cases/sueldo/create-sueldo.use-case";
import { ListSueldoUseCase } from "@/core/application/use-cases/sueldo/list-sueldo.use-case";
import { PrismaSueldoRepository } from "@/core/infrastructure/database/repositories/prisma-sueldo.repository";
import {
  createSueldoSchema,
  listSueldoQuerySchema,
} from "@/core/infrastructure/validation/schemas/sueldo.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaSueldoRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = await validateRequest(
      {
        page: searchParams.get("page") ?? "0",
        size: searchParams.get("size") ?? "10",
        empleadoId: searchParams.get("empleadoId") ?? undefined,
      },
      listSueldoQuerySchema
    );
    const query = {
      page: parsed.page ?? 0,
      size: parsed.size ?? 10,
      empleadoId: parsed.empleadoId,
    };
    const result = await new ListSueldoUseCase(repository).execute(query);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createSueldoSchema);
    const result = await new CreateSueldoUseCase(repository).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
