// src/core/application/use-cases/orden-reparacion/create-orden.use-case.ts
import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { CreatePresupuestoDto } from "../../dto/presupuesto.dto";
import { PresupuestoDBMapper } from "../../mapper/presupuesto-db.mapper";
import { PresupuestoVOMapper } from "../../mapper/presupuesto-vo.mapper";

export class CreatePresupuestoUseCase {
  constructor(private readonly repository: PresupuestoRepository) {}

  async execute(input: CreatePresupuestoDto) {
    const presupuestoVO = await PresupuestoVOMapper.transformInputToVO(input);
    const presupuestoDB =
      PresupuestoDBMapper.transformToCreateData(presupuestoVO);
    return await this.repository.create(presupuestoDB);
  }
}
