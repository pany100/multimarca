import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { Decimal } from "@prisma/client/runtime/library";
import { GetClienteDto } from "../../dto/cliente.dto";
import { ClienteService } from "../../services/cliente.service";

export class GetClienteUseCase {
  constructor(private readonly service: ClienteService) {}

  async execute(dto: GetClienteDto) {
    const cliente = await this.service.findById(dto.id);

    // Process cars with their repair orders
    const cars = cliente.cars.map((car: any) => ({
      ...car,
      ordenesReparacion: car.ordenesReparacion.map((orden: any) => {
        const comprobante = ComprobanteCalculadoFactory.fromOrden(orden);
        return {
          ...orden,
          totalAPagar: comprobante.total,
          deuda: comprobante.deuda,
        };
      }),
    }));

    // Process ventas
    const ventas = cliente.ventas.map((venta: any) => {
      const comprobante = ComprobanteCalculadoFactory.fromOrden({
        ...venta,
        incrementoInterno: new Decimal(0),
      });
      return {
        ...venta,
        totalAPagar: comprobante.total,
        deuda: comprobante.deuda,
      };
    });

    return {
      ...cliente,
      cars,
      ventas,
    };
  }
}
