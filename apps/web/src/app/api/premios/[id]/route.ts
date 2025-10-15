import { DeletePremioUseCase } from "@/core/application/use-cases/premios/delete-premio.use-case";
import { GetPremioUseCase } from "@/core/application/use-cases/premios/get-premio.use-case";
import { UpdatePremioUseCase } from "@/core/application/use-cases/premios/update-premio.use-case";
import { PrismaPremioRepository } from "@/core/infrastructure/database/repositories/prisma-premio.repository";
import { updatePremioSchema } from "@/core/infrastructure/validation/schemas/premio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new GetPremioUseCase(
      new PrismaPremioRepository()
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
    const dto = await validateRequest({ id, ...body }, updatePremioSchema);
    const result = await new UpdatePremioUseCase(
      new PrismaPremioRepository()
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
    const result = await new DeletePremioUseCase(
      new PrismaPremioRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
