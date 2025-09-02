import { NotificationService } from "@/core/application/services/notification.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { VentaService } from "@/core/application/services/venta.service";
import { DeleteVentaUseCase } from "@/core/application/use-cases/venta/delete-venta.use-case";
import { GetVentaUseCase } from "@/core/application/use-cases/venta/get-venta.use-case";
import { UpdateVentaUseCase } from "@/core/application/use-cases/venta/update-venta.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import {
  getVentaQuerySchema,
  updateVentaDtoSchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const dto = await validateRequest(
      {
        id: parseInt(params.id),
      },
      getVentaQuerySchema
    );

    const venta = await new GetVentaUseCase(
      new PrismaVentaRepository()
    ).execute(dto);
    return NextResponse.json(venta, { status: 200 });
  } catch (e) {
    return handleApiError(e);
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
      updateVentaDtoSchema
    );

    const ventaActualizada = await new UpdateVentaUseCase(
      new VentaService(
        new PrismaVentaRepository(),
        new PrismaInventoryAdapter(
          new NotificationService(new PrismaNotificationRepository())
        ),
        new StockManagerService()
      ),
      new PrismaUnitOfWork()
    ).execute(dto);
    return NextResponse.json(ventaActualizada);
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
    const dto = await validateRequest(
      {
        id: params.id,
      },
      getVentaQuerySchema
    );
    const notificationRepo = new PrismaNotificationRepository();
    const notificationService = new NotificationService(notificationRepo);

    await new DeleteVentaUseCase(
      new PrismaUnitOfWork(),
      new VentaService(
        new PrismaVentaRepository(),
        new PrismaInventoryAdapter(notificationService),
        new StockManagerService()
      )
    ).execute(dto.id);

    return NextResponse.json({
      mensaje: "Venta eliminada y stock restaurado",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
