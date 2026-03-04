import { NotificationService } from "@/core/application/services/notification.service";
import { OrdenReparacionService } from "@/core/application/services/orden-reparacion.service";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import { DeleteOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/delete-orden.use-case";
import { GetOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/get-orden.use-case";
import { UpdateOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/update-orden.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaCustomFileRepository } from "@/core/infrastructure/database/repositories/prisma-custom-file.repository";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { PrismaPagoMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-pago-mecanico.repository";
import { PrismaInventoryAdapter } from "@/core/infrastructure/external/prisma-inventory.adapter";
import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import {
  getOrdenQuerySchema,
  updateOrdenSchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { parseMultipartRequest } from "@/shared/utils/multipart-request.helper";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      {
        id: params.id,
      },
      getOrdenQuerySchema
    );
    const ordenReparacion = await new GetOrdenUseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto.id);
    return NextResponse.json(ordenReparacion);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { pdf: scannerPdfFile, body } = await parseMultipartRequest(request);

    const dto = await validateRequest(
      {
        id: params.id,
        ...body,
      },
      updateOrdenSchema
    );
    if (scannerPdfFile) {
      const fileName = scannerPdfFile.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      if (!fileExtension || !["pdf"].includes(fileExtension)) {
        throw new Error("El archivo de scanner debe ser un PDF");
      }
      const fileService = new S3FileStorageAdapter();
      dto.pdfPath = await fileService.uploadFileAndGetUrl(
        scannerPdfFile,
        "tmp"
      );
    }
    const notificationRepo = new PrismaNotificationRepository();
    const notificationService = new NotificationService(notificationRepo);
    const updated = await new UpdateOrdenUseCase(
      new OrdenReparacionService(
        new StockManagerService(),
        new PrismaOrdenReparacionRepository(),
        new PrismaInventoryAdapter(notificationService),
        new PrismaCustomFileRepository()
      )
    ).execute(dto);

    return NextResponse.json(updated);
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
      getOrdenQuerySchema
    );
    const notificationRepo = new PrismaNotificationRepository();
    const notificationService = new NotificationService(notificationRepo);

    await new DeleteOrdenUseCase(
      new PrismaUnitOfWork(),
      new OrdenReparacionService(
        new StockManagerService(),
        new PrismaOrdenReparacionRepository(),
        new PrismaInventoryAdapter(notificationService),
        new PrismaCustomFileRepository()
      )
    ).execute(dto.id);

    return NextResponse.json({
      mensaje: "Orden de reparación eliminada y stock restaurado",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
