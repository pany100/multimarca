import { CreateDocumentoGeneralUseCase } from "@/core/application/use-cases/documento-general/create-documento-general.use-case";
import { ListDocumentoGeneralUseCase } from "@/core/application/use-cases/documento-general/list-documento-general.use-case";
import { PrismaDocumentoGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-documento-general.repository";
import {
  createDocumentoGeneralSchema,
  listDocumentoGeneralQuerySchema,
} from "@/core/infrastructure/validation/schemas/documento-general.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaDocumentoGeneralRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = await validateRequest(
      {
        page: searchParams.get("page") ?? "0",
        size: searchParams.get("size") ?? "10",
        query: searchParams.get("query") ?? undefined,
      },
      listDocumentoGeneralQuerySchema
    );
    const query = {
      page: parsed.page ?? 0,
      size: parsed.size ?? 10,
      query: parsed.query,
    };
    const result = await new ListDocumentoGeneralUseCase(repository).execute(
      query
    );
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createDocumentoGeneralSchema);
    const result = await new CreateDocumentoGeneralUseCase(repository).execute(
      dto
    );
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
