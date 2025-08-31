// src/core/application/use-cases/orden-reparacion/create-orden.use-case.ts
import type { CreateOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import type { NotifierPort } from "@/core/domain/ports/notifier.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { NotificationRepository } from "@/core/domain/repositories/notification.repository";
import { PagoMecanicoRepository } from "@/core/domain/repositories/pago-mecanico.repository";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { EstadoOrdenReparacion, OrdenReparacion } from "@prisma/client";
import { OrdenReparacionDataFactory } from "../../factories/orden-reparacion-data.factory";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class CreateOrdenUseCase {
  constructor(
    private readonly service: OrdenReparacionService,
    private readonly notifier: NotifierPort,
    private readonly uow: UnitOfWork,
    private readonly pagoMecanicoRepo: PagoMecanicoRepository,
    private readonly notificationRepo: NotificationRepository
  ) {}

  async execute(input: CreateOrdenDto) {
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
      await OrdenReparacionDataFactory.transformInputToVO(input);

    const creada = await this.uow.run(async (tx) => {
      const ordenCreada: OrdenReparacion = await this.service.create(
        tx,
        ordenReparacionVO
      );
      if (ordenReparacionVO.estado.isTerminado()) {
        await this.pagoMecanicoRepo.create({
          ordenReparacionId: ordenCreada.id,
        });
        await this.notificationRepo.create({
          fecha: new Date(),
          titulo: "Reparación Terminada",
          texto: `La reparación del auto ${ordenCreada.autoId} se encuentra terminada. Pagar mano de obra.`,
          leida: false,
          ordenReparacionId: ordenCreada.id,
          tipo: "REPARACION_TERMINADA",
        });
      }
      this.notifier.emit("newNotification");
      return ordenCreada;
    });
    return creada;
  }
}
