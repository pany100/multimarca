import { EstadisticaServiceFactory } from "@/core/application/factory/estadistica-service.factory";
import { MecanicosDto } from "@/core/application/dto/estadisticas.dto";
import { GetMecanicosUseCase } from "@/core/application/use-cases/estadisticas/get-mecanicos.use-case";
import { mecanicosQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export const dynamic = "force-dynamic";

interface MecanicoGananciaSemanal {
  mecanicoId: number;
  mecanicoNombre: string;
  weekStart: string;
  weekEnd: string;
  ganancia: number;
}

interface MecanicoGanancias {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: {
    weekStart: string;
    weekEnd: string;
    ganancia: number;
  }[];
  gananciaTotal: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        moneda: searchParams.get("moneda") || "ARS",
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
      },
      mecanicosQuerySchema as unknown as ZodSchema<MecanicosDto>
    );
    const result = await new GetMecanicosUseCase(
      EstadisticaServiceFactory.create()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
