import { DeletePerdidaUseCase } from "@/core/application/use-cases/perdida/delete-perdida.use-case";
import { GetPerdidaUseCase } from "@/core/application/use-cases/perdida/get-perdida.use-case";
import { UpdatePerdidaUseCase } from "@/core/application/use-cases/perdida/update-perdida.use-case";
import { PrismaPerdidaRepository } from "@/core/infrastructure/database/repositories/prisma-perdida.repository";
import {
  getPerdidaQuerySchema,
  updatePerdidaSchema,
} from "@/core/infrastructure/validation/schemas/perdida.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaPerdidaRepository();
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      getPerdidaQuerySchema
    );

    const useCase = new GetPerdidaUseCase(buildRepo());
    const result = await useCase.execute(dto.id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, id: params.id },
      updatePerdidaSchema
    );

    const useCase = new UpdatePerdidaUseCase(buildRepo());
    const result = await useCase.execute(dto);
    
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      getPerdidaQuerySchema
    );

    const useCase = new DeletePerdidaUseCase(buildRepo());
    const result = await useCase.execute(dto.id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
