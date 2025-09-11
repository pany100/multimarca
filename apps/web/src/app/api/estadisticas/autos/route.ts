import { EstadisticaService } from "@/core/application/services/estadistica.service";
import { GetAutosUseCase } from "@/core/application/use-cases/estadisticas/get-autos.use-case";
import { EstadisticasAutosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-autos-queries.service";
import { getAutosQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface MarcaAuto {
  marca: string;
  cantidad: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        año: searchParams.get("año"),
        mes: searchParams.get("mes"),
      },
      getAutosQuerySchema
    );
    const result = await new GetAutosUseCase(
      new EstadisticaService(new EstadisticasAutosQueriesService())
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    handleApiError(e);
  }
}
