import { GetOrdenesClienteUseCase } from "@/core/application/use-cases/cliente/get-ordenes-cliente.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { getOrdenesQuerySchema } from "@/core/infrastructure/validation/schemas/cliente.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        id: clienteId,
        soloConDeuda: searchParams.get("soloConDeuda") === "true",
      },
      getOrdenesQuerySchema
    );
    const ordenesConDeuda = await new GetOrdenesClienteUseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto);

    return NextResponse.json(ordenesConDeuda);
  } catch (e) {
    return handleApiError(e);
  }
}
