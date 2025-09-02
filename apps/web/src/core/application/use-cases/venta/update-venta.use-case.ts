import { UnitOfWork } from "@/core/domain/ports/uow.port";
import { UpdateVentaDto } from "../../dto/venta.dto";
import { VentaVOMapper } from "../../mapper/venta-vo.mapper";
import { VentaService } from "../../services/venta.service";

export class UpdateVentaUseCase {
  constructor(
    private readonly service: VentaService,
    private readonly uow: UnitOfWork
  ) {}

  async execute(dto: UpdateVentaDto) {
    const dtoVO = await VentaVOMapper.transformInputToVO(dto);
    if (!dto.clienteId && !dto.informacionCliente) {
      throw new Error("Debe proporcionar un cliente o información del cliente");
    }
    const actualizada = await this.uow.run(async (tx) => {
      return this.service.update(tx, dtoVO);
    });
    return actualizada;
  }
}
