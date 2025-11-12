import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { GetOrdenesDto } from "../../dto/cliente.dto";

export class GetOrdenesClienteUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(dto: GetOrdenesDto) {
    const ordenes = await this.repo.listForCliente(dto.id);

    if (dto.soloConDeuda) {
      return ordenes.filter((orden) => {
        const calculoVO = ComprobanteCalculadoFactory.fromOrden(orden);
        return calculoVO.deuda > 0;
      });
    }
    return ordenes;
  }
}
