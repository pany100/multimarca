import { CreateRecuperacionUseCase } from "@/core/application/use-cases/recuperacion/create-recuperacion.use-case";
import { ListRecuperacionesUseCase } from "@/core/application/use-cases/recuperacion/list-recuperaciones.use-case";
import { PrismaPerdidaRepository } from "@/core/infrastructure/database/repositories/prisma-perdida.repository";
import { PrismaRecuperacionRepository } from "@/core/infrastructure/database/repositories/prisma-recuperacion.repository";
import {
  createRecuperacionSchema,
  listRecuperacionesQuerySchema,
} from "@/core/infrastructure/validation/schemas/recuperacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRecuperacionRepo() {
  return new PrismaRecuperacionRepository();
}

function buildPerdidaRepo() {
  return new PrismaPerdidaRepository();
}

// GET all recuperaciones for a specific perdida
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { perdidaId: params.id },
      listRecuperacionesQuerySchema
    );

    const useCase = new ListRecuperacionesUseCase(
      buildRecuperacionRepo(),
      buildPerdidaRepo()
    );
    const result = await useCase.execute(dto.perdidaId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST a new recuperacion for a specific perdida
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, perdidaId: params.id },
      createRecuperacionSchema
    );

    const useCase = new CreateRecuperacionUseCase(
      buildRecuperacionRepo(),
      buildPerdidaRepo()
    );
    const result = await useCase.execute(dto);
    
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
