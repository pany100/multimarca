import { DeleteTipoDeOperacionUseCase } from "@/core/application/use-cases/tipos-de-operacion/delete-tipo-de-operacion.use-case";
import { TransaccionesQueriesService } from "@/core/infrastructure/database/queries/transacciones-queries.service";
import { PrismaTipoDeOperacionRepository } from "@/core/infrastructure/database/repositories/prisma-tipo-de-operacion.repository";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (!body.label || typeof body.label !== "string") {
      return NextResponse.json(
        { error: "El campo 'label' es requerido y debe ser un string" },
        { status: 400 }
      );
    }

    // Check if another record with the same label exists (excluding current record)
    const existingTipo = await prisma.tipoDeOperacion.findFirst({
      where: {
        label: body.label,
        id: { not: id },
      },
    });

    if (existingTipo) {
      return NextResponse.json(
        { error: "Ya existe un tipo de operación con ese nombre" },
        { status: 409 }
      );
    }

    const updatedTipoOperacion = await prisma.tipoDeOperacion.update({
      where: { id },
      data: {
        label: body.label,
        esIngreso: body.esIngreso,
        esGasto: body.esGasto,
      },
    });

    return NextResponse.json(updatedTipoOperacion);
  } catch (error) {
    console.error("Error updating tipo de operación:", error);
    return NextResponse.json(
      { error: "Error al actualizar tipo de operación" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await new DeleteTipoDeOperacionUseCase(
      new PrismaTipoDeOperacionRepository(),
      new TransaccionesQueriesService()
    ).execute(id);
    return NextResponse.json(
      { message: "Tipo de operación eliminado con éxito" },
      { status: 200 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
