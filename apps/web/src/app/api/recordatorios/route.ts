import { RecordatorioManoDeObraService } from "@/core/application/services/recordatorio-mano-de-obra.service";
import { ListRecordatoriosUseCase } from "@/core/application/use-cases/recordatorio-mano-de-obra/list-recordatorios.use-case";
import { PrismaRecordatorioManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-recordatorio-mano-de-obra.repository";
import {
  listRecordatoriosQuerySchema,
  ListRecordatoriosQueryDto,
} from "@/core/infrastructure/validation/schemas/recordatorio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { ZodSchema } from "zod";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET: Lista recordatorios de mano de obra (expandidos por diasParaRecordatorio).
 * Query: page, size, query (búsqueda), estado (pendiente | enviado).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      page: searchParams.get("page") ?? "0",
      size: searchParams.get("size") ?? "10",
      query: searchParams.get("query") ?? undefined,
      estado: searchParams.get("estado") ?? undefined,
    };
    const dto = await validateRequest(
      raw as unknown,
      listRecordatoriosQuerySchema as unknown as ZodSchema<ListRecordatoriosQueryDto>
    );

    const repository = new PrismaRecordatorioManoDeObraRepository();
    const recordatorioService = new RecordatorioManoDeObraService(repository);
    const result = await new ListRecordatoriosUseCase(
      recordatorioService
    ).execute({
      page: dto.page,
      size: dto.size,
      query: dto.query,
      estado: dto.estado,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
