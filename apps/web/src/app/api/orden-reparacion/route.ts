import { NotificationService } from "@/core/application/services/notification.service";
import { OrdenReparacionService } from "@/core/application/services/orden-reparacion.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { CreateOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/create-orden.use-case";
import { ListOrdenesUseCase } from "@/core/application/use-cases/orden-reparacion/list-ordenes.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaCustomFileRepository } from "@/core/infrastructure/database/repositories/prisma-custom-file.repository";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import {
  createOrdenSchema,
  listOrdenesQuerySchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

function buildRepo() {
  return new PrismaOrdenReparacionRepository();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page"),
        size: searchParams.get("size"),
        query: searchParams.get("query"),
        estado: searchParams.get("estado"),
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      },
      listOrdenesQuerySchema,
    );

    const result = await new ListOrdenesUseCase(buildRepo()).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createOrdenSchema);

    const notificationService = new NotificationService(
      new PrismaNotificationRepository(),
    );
    const useCase = new CreateOrdenUseCase(
      new OrdenReparacionService(
        new StockManagerService(),
        new PrismaOrdenReparacionRepository(),
        new PrismaInventoryAdapter(notificationService),
        new PrismaCustomFileRepository(),
      ),
      new PrismaUnitOfWork(),
    );

    const created = await useCase.execute(dto);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
