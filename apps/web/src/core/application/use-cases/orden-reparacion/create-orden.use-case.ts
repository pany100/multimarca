// src/core/application/use-cases/orden-reparacion/create-orden.use-case.ts
import type { CreateOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { EstadoOrdenReparacion, OrdenReparacion } from "@prisma/client";
import { OrdenReparacionVOMapper } from "../../mapper/orden-reparacion-vo.mapper";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class CreateOrdenUseCase {
  constructor(
    private readonly service: OrdenReparacionService,
    private readonly uow: UnitOfWork
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

    const ordenReparacionVO = await OrdenReparacionVOMapper.transformInputToVO(
      input
    );

    const creada = await this.uow.run(async (tx) => {
      const ordenCreada: OrdenReparacion = await this.service.create(
        tx,
        ordenReparacionVO
      );
      return ordenCreada;
    });
    return creada;
  }
}
