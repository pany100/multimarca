import { UsuarioRepository } from "@/core/domain/repositories/usuario.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { GastoDto } from "../../dto/gasto.dto";
import { GastoService } from "../../services/gasto.service";

export class UltimaSemanaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly gastoService: GastoService
  ) {}

  processGastosOdR(mecanicosConReparaciones: any[]) {
    return mecanicosConReparaciones.map((mecanico) => {
      const ordenesReparacion = mecanico.ordenesReparacion.map(
        (relacion: any) => relacion.ordenReparacion
      );

      const reparacionesUnicoMecanico = ordenesReparacion.filter(
        (orden: any) => orden.mecanicos.length === 1
      );

      const reparaciones = reparacionesUnicoMecanico.map((orden: any) => {
        const calculoVO = ComprobanteCalculadoFactory.fromOrden(orden);
        const manoDeObra = calculoVO.manoDeObraAPagarSinIva;

        const autoInfo = [
          orden.auto.brand,
          orden.auto.model,
          orden.auto.patent ? `(${orden.auto.patent})` : null,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          idOrep: orden.id,
          fecha: orden.fechaSalidaReparacion,
          auto: autoInfo,
          manoDeObra,
          tipo: "odr" as const,
        };
      });

      return {
        mecanicoId: mecanico.id,
        mecanicoNombre: mecanico.name,
        reparaciones,
      };
    });
  }

  processGastosVentas(mecanicosConVentas: any[]) {
    return mecanicosConVentas.map((mecanico) => {
      const ventas = mecanico.ventas.map(
        (relacion: any) => relacion.venta
      );

      const ventasUnicoMecanico = ventas.filter(
        (venta: any) => venta.mecanicos.length === 1
      );

      const items = ventasUnicoMecanico.map((venta: any) => {
        const calculoVO = ComprobanteCalculadoFactory.fromVenta(venta);
        const manoDeObra = calculoVO.manoDeObraAPagarSinIva;

        const clienteLabel =
          venta.cliente?.fullName || venta.informacionCliente || `Venta #${venta.id}`;

        return {
          idOrep: venta.id,
          fecha: venta.fecha,
          auto: clienteLabel,
          manoDeObra,
          tipo: "venta" as const,
        };
      });

      return {
        mecanicoId: mecanico.id,
        mecanicoNombre: mecanico.name,
        reparaciones: items,
      };
    });
  }

  async processGastos(mecanicosConReparaciones: any[]) {
    return this.processGastosOdR(mecanicosConReparaciones);
  }

  async execute(dto: GastoDto) {
    const user = await this.usuarioRepository.findById(dto.decodedToken.userId);
    if (!user || !user.rol) {
      throw new Error("Usuario no tiene rol asignado");
    }

    const [gastosOdR, gastosVentas] = await Promise.all([
      this.gastoService.getGastoMecanicosUltimaSemana(dto),
      this.gastoService.getVentasMecanicosUltimaSemana(dto),
    ]);

    const dataOdR = this.processGastosOdR(gastosOdR);
    const dataVentas = this.processGastosVentas(gastosVentas);

    // Merge by mechanic
    const mecanicoMap = new Map<number, any>();

    for (const m of dataOdR) {
      mecanicoMap.set(m.mecanicoId, { ...m });
    }

    for (const m of dataVentas) {
      const existing = mecanicoMap.get(m.mecanicoId);
      if (existing) {
        existing.reparaciones = [...existing.reparaciones, ...m.reparaciones];
      } else {
        mecanicoMap.set(m.mecanicoId, { ...m });
      }
    }

    return Array.from(mecanicoMap.values()).map((m) => ({
      ...m,
      manoDeObraTotal: m.reparaciones.reduce(
        (total: number, r: any) => total + r.manoDeObra,
        0
      ),
    }));
  }
}
