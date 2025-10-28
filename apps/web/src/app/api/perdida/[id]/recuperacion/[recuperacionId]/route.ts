import { DeleteRecuperacionUseCase } from "@/core/application/use-cases/recuperacion/delete-recuperacion.use-case";
import { GetRecuperacionUseCase } from "@/core/application/use-cases/recuperacion/get-recuperacion.use-case";
import { UpdateRecuperacionUseCase } from "@/core/application/use-cases/recuperacion/update-recuperacion.use-case";
import { PrismaRecuperacionRepository } from "@/core/infrastructure/database/repositories/prisma-recuperacion.repository";
import {
  getRecuperacionQuerySchema,
  updateRecuperacionSchema,
} from "@/core/infrastructure/validation/schemas/recuperacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaRecuperacionRepository();
}

// GET a specific recuperacion
export async function GET(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id, recuperacionId: params.recuperacionId },
      getRecuperacionQuerySchema
    );

    const useCase = new GetRecuperacionUseCase(buildRepo());
    const result = await useCase.execute(dto.recuperacionId, dto.id);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

// PUT to update a specific recuperacion
export async function PUT(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, id: params.id, recuperacionId: params.recuperacionId },
      updateRecuperacionSchema
    );

    const useCase = new UpdateRecuperacionUseCase(buildRepo());
    const result = await useCase.execute(dto);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

// DELETE a specific recuperacion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id, recuperacionId: params.recuperacionId },
      getRecuperacionQuerySchema
    );

    const useCase = new DeleteRecuperacionUseCase(buildRepo());
    const result = await useCase.execute(dto.recuperacionId, dto.id);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
