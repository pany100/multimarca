import { DeleteLlegadaTardeUseCase } from "@/core/application/use-cases/llegadas-tarde/delete-llegada-tarde.use-case";
import { GetLlegadaTardeUseCase } from "@/core/application/use-cases/llegadas-tarde/get-llegada-tarde.use-case";
import { UpdateLlegadaTardeUseCase } from "@/core/application/use-cases/llegadas-tarde/update-llegada-tarde.use-case";
import { PrismaLlegadaTardeRepository } from "@/core/infrastructure/database/repositories/prisma-llegada-tarde.repository";
import { updateLlegadaTardeSchema } from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new GetLlegadaTardeUseCase(
      new PrismaLlegadaTardeRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const dto = await validateRequest(
      { id, ...body },
      updateLlegadaTardeSchema
    );
    const result = await new UpdateLlegadaTardeUseCase(
      new PrismaLlegadaTardeRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new DeleteLlegadaTardeUseCase(
      new PrismaLlegadaTardeRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
