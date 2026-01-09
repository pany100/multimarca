import { ResumenTransaccionesService } from "@/core/application/services/resumen-transacciones.service";
import { GetResumenUseCase } from "@/core/application/use-cases/resumen-transacciones/get-resumen.use-case";
import { ResumenTransaccionesQueriesService } from "@/core/infrastructure/database/queries/resumen-transacciones-queries.service";
import { PrismaUsuarioRepository } from "@/core/infrastructure/database/repositories/prisma-usuario.repository";
import { resumenSchema } from "@/core/infrastructure/validation/schemas/resumen-transaccion.schema";

export const dynamic = 'force-dynamic';
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

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
        page: searchParams.get("page") || "0",
        size: searchParams.get("pageSize") || searchParams.get("size") || "10",
        query: searchParams.get("query") || "",
        tipoOperacionId: searchParams.get("tipoOperacionId") || null,
        from: searchParams.get("from"),
        to: searchParams.get("to"),
        decodedToken,
      },
      resumenSchema
    );
    const result = await new GetResumenUseCase(
      new PrismaUsuarioRepository(),
      new ResumenTransaccionesService(new ResumenTransaccionesQueriesService())
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
