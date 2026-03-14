import { GastoService } from "@/core/application/services/gasto.service";
import { GetTotalManoObraUltimaSemanaUseCase } from "@/core/application/use-cases/gasto/total-mano-obra-ultima-semana.use-case";
import { UltimaSemanaCompartidaUseCase } from "@/core/application/use-cases/gasto/ultima-semana-compartida.use-case";
import { UltimaSemanaUseCase } from "@/core/application/use-cases/gasto/ultima-semana.use-case";
import { PrismaGastoRepository } from "@/core/infrastructure/database/repositories/prisma-gasto.repository";
import { PrismaUsuarioRepository } from "@/core/infrastructure/database/repositories/prisma-usuario.repository";
import { getUltimaSemanaSchema } from "@/core/infrastructure/validation/schemas/gasto.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const dto = await validateRequest(
      {
        from: searchParams.get("start"),
        to: searchParams.get("end"),
        decodedToken,
      },
      getUltimaSemanaSchema
    );

    const gastoService = new GastoService(new PrismaGastoRepository());
    const usuarioRepository = new PrismaUsuarioRepository();
    const result = await new GetTotalManoObraUltimaSemanaUseCase(
      new UltimaSemanaUseCase(usuarioRepository, gastoService),
      new UltimaSemanaCompartidaUseCase(usuarioRepository, gastoService)
    ).execute(dto);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
