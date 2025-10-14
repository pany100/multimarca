import { EmpleadoService } from "@/core/application/services/empleados.service";
import { GetReparacionesEmpleadoUseCase } from "@/core/application/use-cases/mecanicos/get-reparaciones-empleado.use-case";
import { PrismaEmpleadoRepository } from "@/core/infrastructure/database/repositories/prisma-empleado.repository";
import { getMecanicoReparacionesSchema } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dto = await validateRequest(
      {
        id,
        from,
        to,
      },
      getMecanicoReparacionesSchema
    );

    const reparaciones = await new GetReparacionesEmpleadoUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto);

    return NextResponse.json(reparaciones);
  } catch (error) {
    return handleApiError(error);
  }
}
