import { UsuarioRepository } from "@/core/domain/repositories/usuario.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { GastoDto } from "../../dto/gasto.dto";
import { GastoService } from "../../services/gasto.service";

export class UltimaSemanaCompartidaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly gastoService: GastoService
  ) {}

  processGastosOdR(reparaciones: any[]) {
    const reparacionesMultiplesMecanicos = reparaciones.filter(
      (reparacion) => reparacion.mecanicos.length > 1
    );

    return reparacionesMultiplesMecanicos.map((reparacion) => {
      const calculoVO = ComprobanteCalculadoFactory.fromOrden(reparacion);
      const manoDeObraTotal = calculoVO.manoDeObraAPagarSinIva;

      const mechanics = reparacion.mecanicos.map((rm: any) => ({
        id: rm.mecanico.id,
        name: rm.mecanico.name,
      }));

      const autoInfo = [
        reparacion.auto.brand,
        reparacion.auto.model,
        `(${reparacion.auto.patent})`,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: reparacion.id,
        fecha: reparacion.fechaSalidaReparacion,
        auto: autoInfo,
        mechanics,
        manoDeObraTotal,
        tipo: "odr" as const,
      };
    });
  }

  processGastosVentas(ventas: any[]) {
    const ventasMultiplesMecanicos = ventas.filter(
      (venta) => venta.mecanicos.length > 1
    );

    return ventasMultiplesMecanicos.map((venta) => {
      const calculoVO = ComprobanteCalculadoFactory.fromVenta(venta);
      const manoDeObraTotal = calculoVO.manoDeObraAPagarSinIva;

      const mechanics = venta.mecanicos.map((rm: any) => ({
        id: rm.mecanico.id,
        name: rm.mecanico.name,
      }));

      const clienteLabel =
        venta.cliente?.fullName || venta.informacionCliente || `Venta #${venta.id}`;

      return {
        id: venta.id,
        fecha: venta.fecha,
        auto: clienteLabel,
        mechanics,
        manoDeObraTotal,
        tipo: "venta" as const,
      };
    });
  }

  async processGastos(reparaciones: any[]) {
    return this.processGastosOdR(reparaciones);
  }

  async execute(dto: GastoDto) {
    const user = await this.usuarioRepository.findById(dto.decodedToken.userId);
    if (!user || !user.rol) {
      throw new Error("Usuario no tiene rol asignado");
    }

    const [gastosOdR, gastosVentas] = await Promise.all([
      this.gastoService.getGastoMecanicosUltimaSemanaCompartida(dto),
      this.gastoService.getVentasMecanicosUltimaSemanaCompartida(dto),
    ]);

    const dataOdR = this.processGastosOdR(gastosOdR);
    const dataVentas = this.processGastosVentas(gastosVentas);

    return [...dataOdR, ...dataVentas];
  }
}
