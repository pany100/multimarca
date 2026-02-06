import { DeleteSueldoUseCase } from "@/core/application/use-cases/sueldo/delete-sueldo.use-case";
import { GetSueldoByIdUseCase } from "@/core/application/use-cases/sueldo/get-sueldo-by-id.use-case";
import { UpdateSueldoUseCase } from "@/core/application/use-cases/sueldo/update-sueldo.use-case";
import { PrismaSueldoRepository } from "@/core/infrastructure/database/repositories/prisma-sueldo.repository";
import {
  getSueldoByIdSchema,
  updateSueldoSchema,
} from "@/core/infrastructure/validation/schemas/sueldo.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaSueldoRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { id: parsedId } = await validateRequest({ id }, getSueldoByIdSchema);
    const result = await new GetSueldoByIdUseCase(repository).execute(parsedId);
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
    const { id } = params;
    const body = await request.json();
    const dto = await validateRequest({ id, ...body }, updateSueldoSchema);
    const result = await new UpdateSueldoUseCase(repository).execute(dto);
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
    const { id } = params;
    const { id: parsedId } = await validateRequest({ id }, getSueldoByIdSchema);
    await new DeleteSueldoUseCase(repository).execute(parsedId);
    return NextResponse.json({
      message: "Sueldo eliminado con éxito",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
