import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import { OrdenReparacionWithRelations } from "@/core/domain/repositories/orden-reparacion.repository";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { EstadoOrdenReparacion, TipoNotificacionInterna } from "@prisma/client";
import { UpdateOrdenDto } from "../../dto/orden-reparacion.dto";
import { OrdenReparacionVOMapper } from "../../mapper/orden-reparacion-vo.mapper";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class UpdateOrdenUseCase {
  constructor(private readonly service: OrdenReparacionService) {}

  async execute(input: UpdateOrdenDto) {
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
      await OrdenReparacionVOMapper.transformUpdateInputToVO(input);
    const uow = new PrismaUnitOfWork();
    const updated = await uow.run(async (tx) =>
      this.service.update(tx, ordenReparacionVO)
    );

    return updated;
  }
}
