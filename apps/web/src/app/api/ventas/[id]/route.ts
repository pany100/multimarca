import { PatchVentaUseCase } from "@/core/application/use-cases/venta/patch-venta.use-case";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import { patchVentaSchema } from "@/core/infrastructure/validation/schemas/venta.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const repository = new PrismaVentaRepository();
    const venta = await repository.findById(id);

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(venta, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, id: parseInt(params.id) },
      patchVentaSchema
    );

    const useCase = new PatchVentaUseCase(new PrismaVentaRepository());
    const updatedVenta = await useCase.execute(dto);

    return NextResponse.json(updatedVenta, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
