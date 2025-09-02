import { NotificationService } from "@/core/application/services/notification.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { VentaService } from "@/core/application/services/venta.service";
import { CreateVentaUseCase } from "@/core/application/use-cases/venta/create-venta.use-case";
import { ListVentaUseCase } from "@/core/application/use-cases/venta/list-venta.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
import {
  createVentaDtoSchema,
  listVentasQuerySchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { EstadoVenta } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page") || "0",
        size: searchParams.get("pageSize") || searchParams.get("size") || "10",
        query: searchParams.get("query") || "",
        estado: searchParams.get("estado") as EstadoVenta | null,
      },
      listVentasQuerySchema
    );
    const result = await new ListVentaUseCase(
      new PrismaVentaRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createVentaDtoSchema);
    const useCase = new CreateVentaUseCase(
      new VentaService(
        new PrismaVentaRepository(),
        new PrismaInventoryAdapter(
          new NotificationService(new PrismaNotificationRepository())
        ),
        new StockManagerService()
      ),
      new SocketNotifier(),
      new PrismaUnitOfWork()
    );
    const created = await useCase.execute(dto);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
