import { NotifierPort } from "@/core/domain/ports/notifier.port";
import { UnitOfWork } from "@/core/domain/ports/uow.port";
import { CreateVentaDto } from "../../dto/venta.dto";
import { VentaVOMapper } from "../../mapper/venta-vo.mapper";
import { VentaService } from "../../services/venta.service";

export class CreateVentaUseCase {
  constructor(
    private readonly service: VentaService,
    private readonly notifier: NotifierPort,
    private readonly uow: UnitOfWork
  ) {}

  async execute(dto: CreateVentaDto) {
    const dtoVO = await VentaVOMapper.transformInputToVO(dto);
    if (!dto.clienteId && !dto.informacionCliente) {
      throw new Error("Debe proporcionar un cliente o información del cliente");
    }
    const creada = await this.uow.run(async (tx) => {
      return this.service.create(tx, dtoVO);
    });
    return creada;
  }
}
