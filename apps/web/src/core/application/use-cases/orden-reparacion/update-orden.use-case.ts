import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import { NotifierPort } from "@/core/domain/ports/notifier.port";
import { NotificationRepository } from "@/core/domain/repositories/notification.repository";
import { OrdenReparacionWithRelations } from "@/core/domain/repositories/orden-reparacion.repository";
import { PagoMecanicoRepository } from "@/core/domain/repositories/pago-mecanico.repository";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { EstadoOrdenReparacion, TipoNotificacionInterna } from "@prisma/client";
import { UpdateOrdenDto } from "../../dto/orden-reparacion.dto";
import { OrdenReparacionDataFactory } from "../../factories/orden-reparacion-data.factory";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class UpdateOrdenUseCase {
  constructor(
    private readonly service: OrdenReparacionService,
    private readonly notificationRepo: NotificationRepository,
    private readonly pagoMecanicoRepo: PagoMecanicoRepository,
    private readonly notifier: NotifierPort
  ) {}

  private async doPostFinishedActions(
    updatedOrder: OrdenReparacionWithRelations
  ) {
    const pagoMecanico = await this.pagoMecanicoRepo.findByOrdenId(
      updatedOrder.id
    );
    if (!pagoMecanico) {
      await this.pagoMecanicoRepo.create({
        ordenReparacionId: updatedOrder.id,
      });
    }
    const notification = await this.notificationRepo.findByOrderIdAndType(
      updatedOrder.id,
      TipoNotificacionInterna.REPARACION_TERMINADA
    );
    if (!notification) {
      await this.notificationRepo.create({
        fecha: new Date(),
        titulo: "Reparación Terminada",
        texto: `La reparación del auto ${updatedOrder.auto.brand} ${updatedOrder.auto.patent} se encuentra terminada. Tiene que pagar la mano de obra correspondiente.`,
        leida: false,
        ordenReparacionId: updatedOrder.id,
        tipo: TipoNotificacionInterna.REPARACION_TERMINADA,
      });
    }
  }

  async execute(input: UpdateOrdenDto, scannerPdfFile: File | null) {
    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Aceptado
    );

    // Validación de "terminada"
    if (estado.isTerminado()) {
      if (!hasAllRequiredFields(input))
        throw new Error(
          "Para finalizar, se requieren mecánicos, fechas y al menos un trabajo/repuesto/tercero."
        );
    }
    const ordenReparacionVO =
      await OrdenReparacionDataFactory.transformUpdateInputToVO(
        input,
        scannerPdfFile
      );
    const uow = new PrismaUnitOfWork();
    const updated = await uow.run(async (tx) => {
      const updatedOrder = await this.service.update(tx, ordenReparacionVO);
      if (ordenReparacionVO.estado.isTerminado()) {
        await this.doPostFinishedActions(updatedOrder);
      }
      this.notifier.emit("newNotification");
      return updatedOrder;
    });

    return updated;
  }
}
