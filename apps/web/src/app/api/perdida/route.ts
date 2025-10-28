import { CreatePerdidaUseCase } from "@/core/application/use-cases/perdida/create-perdida.use-case";
import { ListPerdidasUseCase } from "@/core/application/use-cases/perdida/list-perdidas.use-case";
import { PrismaPerdidaRepository } from "@/core/infrastructure/database/repositories/prisma-perdida.repository";
import {
  createPerdidaSchema,
  listPerdidasQuerySchema,
} from "@/core/infrastructure/validation/schemas/perdida.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaPerdidaRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page"),
        size: searchParams.get("size"),
        query: searchParams.get("query"),
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      },
      listPerdidasQuerySchema
    );

    const result = await new ListPerdidasUseCase(buildRepo()).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createPerdidaSchema);

    const useCase = new CreatePerdidaUseCase(buildRepo());
    const created = await useCase.execute(dto);

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
