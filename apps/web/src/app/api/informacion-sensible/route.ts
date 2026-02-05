import { CreateInformacionSensibleUseCase } from "@/core/application/use-cases/informacion-sensible/create-informacion-sensible.use-case";
import { ListInformacionSensibleUseCase } from "@/core/application/use-cases/informacion-sensible/list-informacion-sensible.use-case";
import { PrismaInformacionSensibleRepository } from "@/core/infrastructure/database/repositories/prisma-informacion-sensible.repository";
import { createInformacionSensibleSchema } from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaInformacionSensibleRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await new ListInformacionSensibleUseCase(
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
    const dto = await validateRequest(body, createInformacionSensibleSchema);
    const result = await new CreateInformacionSensibleUseCase(
      new PrismaInformacionSensibleRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
