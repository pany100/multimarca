import { DeleteNotaAdministrativaUseCase } from "@/core/application/use-cases/nota-administrativa/delete-nota-administrativa.use-case";
import { GetNotaAdministrativaByIdUseCase } from "@/core/application/use-cases/nota-administrativa/get-nota-administrativa-by-id.use-case";
import { UpdateNotaAdministrativaUseCase } from "@/core/application/use-cases/nota-administrativa/update-nota-administrativa.use-case";
import { PrismaNotaAdministrativaRepository } from "@/core/infrastructure/database/repositories/prisma-nota-administrativa.repository";
import {
  getNotaAdministrativaByIdSchema,
  updateNotaAdministrativaSchema,
} from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaNotaAdministrativaRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { id: parsedId } = await validateRequest(
      { id },
      getNotaAdministrativaByIdSchema
    );
    const result =
      await new GetNotaAdministrativaByIdUseCase(repository).execute(parsedId);
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
    const dto = await validateRequest(
      { id, ...body },
      updateNotaAdministrativaSchema
    );
    const result =
      await new UpdateNotaAdministrativaUseCase(repository).execute(dto);
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
      getNotaAdministrativaByIdSchema
    );
    await new DeleteNotaAdministrativaUseCase(repository).execute(parsedId);
    return NextResponse.json({
      message: "Nota administrativa eliminada con éxito",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
