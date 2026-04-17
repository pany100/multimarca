import { DeleteDocumentoGeneralUseCase } from "@/core/application/use-cases/documento-general/delete-documento-general.use-case";
import { GetDocumentoGeneralUseCase } from "@/core/application/use-cases/documento-general/get-documento-general.use-case";
import { UpdateDocumentoGeneralUseCase } from "@/core/application/use-cases/documento-general/update-documento-general.use-case";
import { PrismaDocumentoGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-documento-general.repository";
import {
  getDocumentoGeneralByIdSchema,
  updateDocumentoGeneralSchema,
} from "@/core/infrastructure/validation/schemas/documento-general.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaDocumentoGeneralRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { id: parsedId } = await validateRequest(
      { id },
      getDocumentoGeneralByIdSchema
    );
    const result = await new GetDocumentoGeneralUseCase(repository).execute(
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
    const dto = await validateRequest(
      { id, ...body },
      updateDocumentoGeneralSchema
    );
    const result = await new UpdateDocumentoGeneralUseCase(repository).execute(
      dto
    );
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
      getDocumentoGeneralByIdSchema
    );
    await new DeleteDocumentoGeneralUseCase(repository).execute(parsedId);
    return NextResponse.json({
      message: "Documento eliminado con éxito",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
