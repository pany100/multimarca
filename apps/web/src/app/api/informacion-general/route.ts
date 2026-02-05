import { CreateInformacionGeneralUseCase } from "@/core/application/use-cases/informacion-general/create-informacion-general.use-case";
import { ListInformacionGeneralUseCase } from "@/core/application/use-cases/informacion-general/list-informacion-general.use-case";
import { PrismaInformacionGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-informacion-general.repository";
import { createInformacionGeneralSchema } from "@/core/infrastructure/validation/schemas/informacion-general.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaInformacionGeneralRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await new ListInformacionGeneralUseCase(
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
    const dto = await validateRequest(body, createInformacionGeneralSchema);
    const result = await new CreateInformacionGeneralUseCase(
      new PrismaInformacionGeneralRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
