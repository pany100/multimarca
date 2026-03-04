import { mapCertificadoEstudioToResponse } from "@/core/application/mapper/empleado-response.mapper";
import { CreateCertificadoEstudioUseCase } from "@/core/application/use-cases/certificado-estudio/create-certificado-estudio.use-case";
import { ListCertificadoEstudioUseCase } from "@/core/application/use-cases/certificado-estudio/list-certificado-estudio.use-case";
import { PrismaCertificadoEstudioRepository } from "@/core/infrastructure/database/repositories/prisma-certificado-estudio.repository";
import {
  createCertificadoEstudioSchema,
  listCertificadoEstudioQuerySchema,
} from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaCertificadoEstudioRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = await validateRequest(
      {
        page: searchParams.get("page") ?? "0",
        size: searchParams.get("size") ?? "10",
        empleadoId: searchParams.get("empleadoId") ?? undefined,
      },
      listCertificadoEstudioQuerySchema
    );
    const query = {
      page: parsed.page ?? 0,
      size: parsed.size ?? 10,
      empleadoId: parsed.empleadoId,
    };
    const result = await new ListCertificadoEstudioUseCase(repository).execute(
      query
    );
    const items = result.items.map((item) => mapCertificadoEstudioToResponse(item));
    return NextResponse.json({ ...result, items });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createCertificadoEstudioSchema);
    const result =
      await new CreateCertificadoEstudioUseCase(repository).execute(dto);
    return NextResponse.json(mapCertificadoEstudioToResponse(result), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
