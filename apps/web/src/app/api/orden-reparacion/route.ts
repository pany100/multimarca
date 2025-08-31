import { OrdenReparacionService } from "@/core/application/services/orden-reparacion.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { CreateOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/create-orden.use-case";
import { ListOrdenesUseCase } from "@/core/application/use-cases/orden-reparacion/list-ordenes.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { PrismaPagoMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-pago-mecanico.repository";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
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
      },
      listOrdenesQuerySchema
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

    const notificationRepo = new PrismaNotificationRepository();
    const s3FileAdapter = new S3FileStorageAdapter();
    const exchangeAdapter = new DolarExchangeAdapter();
    const useCase = new CreateOrdenUseCase(
      new OrdenReparacionService(
        new StockManagerService(),
        new PrismaOrdenReparacionRepository(),
        new PrismaPagoMecanicoRepository(),
        notificationRepo,
        new PrismaInventoryAdapter(notificationRepo),
        s3FileAdapter,
        exchangeAdapter
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
