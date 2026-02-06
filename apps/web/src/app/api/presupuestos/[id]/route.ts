import { PresupuestoService } from "@/core/application/services/presupuesto.service";
import { DeletePresupuestoUseCase } from "@/core/application/use-cases/presupuesto/delete-presupuesto.use-case";
import { PatchPresupuestoUseCase } from "@/core/application/use-cases/presupuesto/patch-presupuesto.use-case";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { PrismaPresupuestoRepository } from "@/core/infrastructure/database/repositories/prisma-presupuesto.repository";
import {
  getPresupuestoQuerySchema,
  patchPresupuestoSchema,
} from "@/core/infrastructure/validation/schemas/presupuesto.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      getPresupuestoQuerySchema
    );
    const repository = new PrismaPresupuestoRepository();
    const presupuesto = await repository.findById(dto.id);

    if (!presupuesto) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Calcular totales
    const comprobanteCalculado =
      ComprobanteCalculadoFactory.fromPresupuesto(presupuesto);

    const reparacionesDeTercero = presupuesto.reparacionesDeTercero.map(
      (el) => ({
        ...el,
        recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
        precioConRecargo: comprobanteCalculado.getPrecioFinalForReparaciones(
          Number(el.precioVenta)
        ),
      })
    );

    const cedulaPath =
      presupuesto.cedulaFile?.finalPath || presupuesto.cedulaFile?.tempPath || null;

    return NextResponse.json({
      ...presupuesto,
      cedulaPath,
      reparacionesDeTercero,
      total: comprobanteCalculado.total,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalReparacionesDeTerceros: comprobanteCalculado.totalTerceros,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const dto = await validateRequest(
      {
        id: params.id,
        ...body,
      },
      patchPresupuestoSchema
    );

    const presupuestoActualizado = await new PatchPresupuestoUseCase(
      new PrismaPresupuestoRepository()
    ).execute(dto);

    return NextResponse.json(presupuestoActualizado, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      getPresupuestoQuerySchema
    );

    const repository = new PrismaPresupuestoRepository();
    const service = new PresupuestoService(repository);

    await new DeletePresupuestoUseCase(service).execute(dto.id);

    return NextResponse.json(
      { message: "Presupuesto eliminado exitosamente" },
      { status: 200 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
