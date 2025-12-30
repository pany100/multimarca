import { CreateDraftOrdenV2UseCase } from "@/core/application/use-cases/orden-reparacion/create-draft-orden-v2.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { createDraftOrdenSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createDraftOrdenSchema);

    const created = await new CreateDraftOrdenV2UseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto);

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
