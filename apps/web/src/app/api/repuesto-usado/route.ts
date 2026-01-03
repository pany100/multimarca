import { NotificationService } from "@/core/application/services/notification.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { AddRepuestoUsadoUseCase } from "@/core/application/use-cases/orden-reparacion/add-repuesto-usado.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaRepuestoUsadoRepository } from "@/core/infrastructure/database/repositories/prisma-repuesto-usado.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import { addRepuestoUsadoSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, addRepuestoUsadoSchema);

    const notificationService = new NotificationService(
      new PrismaNotificationRepository()
    );

    const useCase = new AddRepuestoUsadoUseCase(
      new PrismaRepuestoUsadoRepository(),
      new PrismaUnitOfWork(),
      new StockManagerService(),
      new PrismaInventoryAdapter(notificationService)
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
