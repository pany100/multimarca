import { CreateDatosVariosUseCase } from "@/core/application/use-cases/datos-varios/create-datos-varios.use-case";
import { ListDatosVariosUseCase } from "@/core/application/use-cases/datos-varios/list-datos-varios.use-case";
import { PrismaDatosVariosRepository } from "@/core/infrastructure/database/repositories/prisma-datos-varios.repository";
import { createDatosVariosSchema } from "@/core/infrastructure/validation/schemas/datos-varios.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaDatosVariosRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await new ListDatosVariosUseCase(buildRepo()).execute({
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
    const dto = await validateRequest(body, createDatosVariosSchema);
    const result = await new CreateDatosVariosUseCase(
      new PrismaDatosVariosRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
