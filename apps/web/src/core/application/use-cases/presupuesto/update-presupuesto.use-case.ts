import { UpdatePresupuestoDto } from "../../dto/presupuesto.dto";
import { PresupuestoVOMapper } from "../../mapper/presupuesto-vo.mapper";
import { PresupuestoService } from "../../services/presupuesto.service";

export class UpdatePresupuestoUseCase {
  constructor(private readonly service: PresupuestoService) {}

  async execute(input: UpdatePresupuestoDto) {
    const presupuestoVO = await PresupuestoVOMapper.transformInputToVO(input);
    return await this.service.update(presupuestoVO);
  }
}
