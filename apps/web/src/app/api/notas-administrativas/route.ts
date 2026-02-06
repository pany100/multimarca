import { CreateNotaAdministrativaUseCase } from "@/core/application/use-cases/nota-administrativa/create-nota-administrativa.use-case";
import { ListNotaAdministrativaUseCase } from "@/core/application/use-cases/nota-administrativa/list-nota-administrativa.use-case";
import { PrismaNotaAdministrativaRepository } from "@/core/infrastructure/database/repositories/prisma-nota-administrativa.repository";
import {
  createNotaAdministrativaSchema,
  listNotaAdministrativaQuerySchema,
} from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaNotaAdministrativaRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = await validateRequest(
      {
        page: searchParams.get("page") ?? "0",
        size: searchParams.get("size") ?? "10",
        empleadoId: searchParams.get("empleadoId") ?? undefined,
      },
      listNotaAdministrativaQuerySchema
    );
    const query = {
      page: parsed.page ?? 0,
      size: parsed.size ?? 10,
      empleadoId: parsed.empleadoId,
    };
    const result =
      await new ListNotaAdministrativaUseCase(repository).execute(query);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createNotaAdministrativaSchema);
    const result =
      await new CreateNotaAdministrativaUseCase(repository).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
