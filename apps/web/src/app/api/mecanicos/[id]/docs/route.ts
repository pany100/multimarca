import { EmpleadoService } from "@/core/application/services/empleados.service";
import { UpdateEmpleadoDocsUseCase } from "@/core/application/use-cases/mecanicos/update-docs-empleado.use-case";
import { PrismaEmpleadoRepository } from "@/core/infrastructure/database/repositories/prisma-empleado.repository";
import { updateMecanicoDocsSchema } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const dto = await validateRequest(
      {
        id,
        ...body,
      },
      updateMecanicoDocsSchema
    );
    const empleado = await new UpdateEmpleadoDocsUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto);
    return NextResponse.json(empleado);
  } catch (error) {
    return handleApiError(error);
  }
}
