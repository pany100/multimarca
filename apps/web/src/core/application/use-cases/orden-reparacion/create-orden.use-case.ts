// src/core/application/use-cases/orden-reparacion/create-orden.use-case.ts
import type { CreateOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import type { NotifierPort } from "@/core/domain/ports/notifier.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { EstadoOrdenReparacion } from "@prisma/client";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class CreateOrdenUseCase {
  constructor(
    private readonly service: OrdenReparacionService,
    private readonly notifier: NotifierPort,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: CreateOrdenDto) {
    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Presupuestado
    );

    // Validación de "terminada"
    if (estado.isTerminado()) {
      if (!hasAllRequiredFields(input))
        throw new Error(
          "Para finalizar, se requieren mecánicos, fechas y al menos un trabajo/repuesto/tercero."
        );
    }

    const creada = await this.uow.run(async (tx) => {
      return await this.service.create(tx, input);
    });

    this.notifier.emit("newNotification");
    return creada;
  }
}
