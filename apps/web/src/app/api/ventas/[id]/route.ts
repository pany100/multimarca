import { NotificationService } from "@/core/application/services/notification.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { VentaService } from "@/core/application/services/venta.service";
import { DeleteVentaUseCase } from "@/core/application/use-cases/venta/delete-venta.use-case";
import { GetVentaUseCase } from "@/core/application/use-cases/venta/get-venta.use-case";
import { PatchVentaUseCase } from "@/core/application/use-cases/venta/patch-venta.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
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
    const useCase = new GetVentaUseCase(new PrismaVentaRepository());
    const venta = await useCase.execute({ id });

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    const notificationRepo = new PrismaNotificationRepository();
    const notificationService = new NotificationService(notificationRepo);

    await new DeleteVentaUseCase(
      new PrismaUnitOfWork(),
      new VentaService(
        new PrismaVentaRepository(),
        new PrismaInventoryAdapter(notificationService),
        new StockManagerService()
      )
    ).execute(id);

    return NextResponse.json({
      mensaje: "Venta eliminada y stock restaurado",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
