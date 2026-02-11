import { PatchOrdenV2UseCase } from "@/core/application/use-cases/orden-reparacion/patch-orden-v2.use-case";
import { NotificationService } from "@/core/application/services/notification.service";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { PrismaPagoMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-pago-mecanico.repository";
import { patchOrdenV2Schema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { TipoNotificacionInterna } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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
      patchOrdenV2Schema
    );

    const repository = new PrismaOrdenReparacionRepository();
    const ordenAntes = await repository.findById(parseInt(dto.id));
    const estadoAnterior = ordenAntes?.estado ?? null;

    const ordenActualizada = await new PatchOrdenV2UseCase(
      repository
    ).execute(dto);

    // Solo crear pago y notificación cuando el estado PASA a Terminado (no si ya estaba Terminado)
    const pasoATerminado =
      estadoAnterior !== "Terminado" && dto.estado === "Terminado";

    if (pasoATerminado) {
      const notificationRepo = new PrismaNotificationRepository();
      const notificationService = new NotificationService(notificationRepo);
      const pagoRepo = new PrismaPagoMecanicoRepository();

      const existingPago = await pagoRepo.findByOrdenId(ordenActualizada.id);
      if (!existingPago) {
        await pagoRepo.create({
          ordenReparacionId: ordenActualizada.id,
        });
      }

      const existingNotification =
        await notificationService.findByOrderIdAndType(
          ordenActualizada.id,
          TipoNotificacionInterna.REPARACION_TERMINADA
        );
      if (!existingNotification) {
        const autoInfo =
          ordenActualizada.auto != null
            ? `${ordenActualizada.auto.brand ?? ""} ${ordenActualizada.auto.patent ?? ""}`.trim() || "N/A"
            : "N/A";
        await notificationService.create({
          fecha: new Date(),
          titulo: "Reparación Terminada",
          texto: `La reparación del auto ${autoInfo} se encuentra terminada. Tiene que pagar la mano de obra correspondiente.`,
          leida: false,
          ordenReparacionId: ordenActualizada.id,
          tipo: TipoNotificacionInterna.REPARACION_TERMINADA,
        });
      }
    }

    return NextResponse.json(ordenActualizada, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
