import { UsuarioRepository } from "@/core/domain/repositories/usuario.repository";
import { GastoDto } from "../../dto/gasto.dto";
import { GastoService } from "../../services/gasto.service";

export class UltimaSemanaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly gastoService: GastoService
  ) {}

  async processGastos(mecanicosConReparaciones: any[]) {
    return mecanicosConReparaciones.map((mecanico) => {
      // Extraer las órdenes de reparación desde la relación intermedia
      const ordenesReparacion = mecanico.ordenesReparacion.map(
        (relacion: any) => relacion.ordenReparacion
      );

      // Filtrar solo las reparaciones donde este mecánico es el único
      const reparacionesUnicoMecanico = ordenesReparacion.filter(
        (orden: any) => orden.mecanicos.length === 1
      );

      // Procesar cada reparación
      const reparaciones = reparacionesUnicoMecanico.map((orden: any) => {
        // Calcular mano de obra total
        const manoDeObra = orden.trabajosRealizados.reduce(
          (total: number, trabajo: any) =>
            total + Number(trabajo.precioUnitario),
          0
        );

        // Verificar si está pagado (si tiene al menos un pago válido)
        const pagado = orden.pagos.length > 0;

        return {
          idOrep: orden.id,
          fecha: orden.fechaSalidaReparacion,
          auto: orden.auto.patent,
          manoDeObra,
          pagado,
        };
      });

      // Calcular totales
      const manoDeObraTotal = reparaciones.reduce(
        (total: number, reparacion: any) =>
          total + reparacion.manoDeObra - reparacion.descuento,
        0
      );

      const manoDeObraPagada = reparaciones.reduce(
        (total: number, reparacion: any) =>
          total + (reparacion.pagado ? reparacion.manoDeObra : 0),
        0
      );

      return {
        mecanicoId: mecanico.id,
        mecanicoNombre: mecanico.name,
        reparaciones,
        manoDeObraTotal,
        manoDeObraPagada,
      };
    });
  }

  async execute(dto: GastoDto) {
    const { from, to, decodedToken } = dto;
    const user = await this.usuarioRepository.findById(dto.decodedToken.userId);
    if (!user || !user.rol) {
      throw new Error("Usuario no tiene rol asignado");
    }

    const gastos = await this.gastoService.getGastoMecanicosUltimaSemana(dto);
    return this.processGastos(gastos);
  }
}
