import { CreateManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/create-mano-de-obra.use-case";
import { ListManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/list-mano-de-obra.use-case";
import { PrismaManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-mano-de-obra.repository";
import {
  createManoDeObraSchema,
  listManoDeObraQuerySchema,
} from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaManoDeObraRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = await validateRequest(
      {
        page: searchParams.get("page") ?? "0",
        size: searchParams.get("size") ?? "10",
        query: searchParams.get("query") ?? "",
      },
      listManoDeObraQuerySchema
    );
    const query = {
      page: parsed.page ?? 0,
      size: parsed.size ?? 10,
      query: parsed.query ?? "",
    };
    const result = await new ListManoDeObraUseCase(repository).execute(query);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createManoDeObraSchema);
    const result = await new CreateManoDeObraUseCase(repository).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
