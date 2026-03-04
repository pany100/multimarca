import { mapCertificadoEstudioToResponse } from "@/core/application/mapper/empleado-response.mapper";
import { DeleteCertificadoEstudioUseCase } from "@/core/application/use-cases/certificado-estudio/delete-certificado-estudio.use-case";
import { GetCertificadoEstudioByIdUseCase } from "@/core/application/use-cases/certificado-estudio/get-certificado-estudio-by-id.use-case";
import { UpdateCertificadoEstudioUseCase } from "@/core/application/use-cases/certificado-estudio/update-certificado-estudio.use-case";
import { PrismaCertificadoEstudioRepository } from "@/core/infrastructure/database/repositories/prisma-certificado-estudio.repository";
import {
  getCertificadoEstudioByIdSchema,
  updateCertificadoEstudioSchema,
} from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaCertificadoEstudioRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { id: parsedId } = await validateRequest(
      { id },
      getCertificadoEstudioByIdSchema
    );
    const result =
      await new GetCertificadoEstudioByIdUseCase(repository).execute(parsedId);
    if (!result) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(mapCertificadoEstudioToResponse(result));
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
      updateCertificadoEstudioSchema
    );
    const result =
      await new UpdateCertificadoEstudioUseCase(repository).execute(dto);
    return NextResponse.json(mapCertificadoEstudioToResponse(result));
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
      getCertificadoEstudioByIdSchema
    );
    await new DeleteCertificadoEstudioUseCase(repository).execute(parsedId);
    return NextResponse.json({
      message: "Certificado de estudio eliminado con éxito",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
