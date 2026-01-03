import { NotificationService } from "@/core/application/services/notification.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { DeleteRepuestoUsadoUseCase } from "@/core/application/use-cases/orden-reparacion/delete-repuesto-usado.use-case";
import { UpdateRepuestoUsadoUseCase } from "@/core/application/use-cases/orden-reparacion/update-repuesto-usado.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaRepuestoUsadoRepository } from "@/core/infrastructure/database/repositories/prisma-repuesto-usado.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import {
  deleteRepuestoUsadoSchema,
  updateRepuestoUsadoSchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      {
        id: params.id,
        ...body,
      },
      updateRepuestoUsadoSchema
    );

    const notificationService = new NotificationService(
      new PrismaNotificationRepository()
    );

    const useCase = new UpdateRepuestoUsadoUseCase(
      new PrismaRepuestoUsadoRepository(),
      new PrismaUnitOfWork(),
      new StockManagerService(),
      new PrismaInventoryAdapter(notificationService)
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      {
        id: params.id,
      },
      deleteRepuestoUsadoSchema
    );

    const useCase = new DeleteRepuestoUsadoUseCase(
      new PrismaRepuestoUsadoRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json({
      mensaje: "Repuesto usado eliminado",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
