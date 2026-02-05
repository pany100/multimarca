import { DeleteManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/delete-mano-de-obra.use-case";
import { GetManoDeObraByIdUseCase } from "@/core/application/use-cases/mano-de-obra/get-mano-de-obra-by-id.use-case";
import { UpdateManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/update-mano-de-obra.use-case";
import { PrismaManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-mano-de-obra.repository";
import {
  getManoDeObraByIdSchema,
  updateManoDeObraSchema,
} from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaManoDeObraRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { id: parsedId } = await validateRequest(
      { id },
      getManoDeObraByIdSchema
    );
    const result = await new GetManoDeObraByIdUseCase(repository).execute(
      parsedId
    );
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
    const dto = await validateRequest({ id, ...body }, updateManoDeObraSchema);
    const result = await new UpdateManoDeObraUseCase(repository).execute(dto);
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
    const { id: parsedId } = await validateRequest(
      { id },
      getManoDeObraByIdSchema
    );
    await new DeleteManoDeObraUseCase(repository).execute(parsedId);
    return NextResponse.json({
      message: "Trabajo de mano de obra eliminado con éxito",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
