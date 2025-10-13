import { EmpleadoService } from "@/core/application/services/empleados.service";
import { DeleteEmpleadoUseCase } from "@/core/application/use-cases/mecanicos/delete-empleado.use-case";
import { EditEmpleadoUseCase } from "@/core/application/use-cases/mecanicos/edit-empleado.use-case";
import { GetEmpleadoUseCase } from "@/core/application/use-cases/mecanicos/get-empleado.use-case";
import { PrismaEmpleadoRepository } from "@/core/infrastructure/database/repositories/prisma-empleado.repository";
import {
  editMecanicoSchema,
  getMecanicoSchema,
} from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const dto = await validateRequest({ id }, getMecanicoSchema);
    const empleado = await new GetEmpleadoUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto.id);
    return NextResponse.json(empleado);
  } catch (error) {
    return handleApiError(error);
  }
}

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
      editMecanicoSchema
    );
    const empleado = await new EditEmpleadoUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto);
    return NextResponse.json(empleado);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const dto = await validateRequest({ id }, getMecanicoSchema);
    const empleado = await new DeleteEmpleadoUseCase(
      new EmpleadoService(new PrismaEmpleadoRepository())
    ).execute(dto.id);

    if (!empleado) {
      return NextResponse.json(
        { error: "Mecánico no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Mecánico eliminado con éxito",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
