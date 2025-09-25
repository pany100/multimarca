import { UsuarioRepository } from "@/core/domain/repositories/usuario.repository";
import { GastoDto } from "../../dto/gasto.dto";
import { GastoService } from "../../services/gasto.service";

export class UltimaSemanaCompartidaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly gastoService: GastoService
  ) {}

  async processGastos(reparaciones: any[]) {
    // Filter repairs that actually have multiple mechanics
    const reparacionesMultiplesMecanicos = reparaciones.filter(
      (reparacion) => reparacion.mecanicos.length > 1
    );

    // Process and format the repairs data
    const result = reparacionesMultiplesMecanicos.map((reparacion) => {
      // Calculate total manoDeObra for this repair order
      const manoDeObraTotal =
        reparacion.trabajosRealizados.reduce(
          (total: number, trabajo: any) =>
            total + Number(trabajo.precioUnitario),
          0
        ) - reparacion.descuento;

      // Check if the repair order has been paid
      const pagado = reparacion.pagos.length > 0;

      // Calculate total manoDeObra for paid repair orders
      const manoDeObraPagada = pagado ? manoDeObraTotal : 0;

      // Format mechanics list
      const mechanics = reparacion.mecanicos.map((rm: any) => ({
        id: rm.mecanico.id,
        name: rm.mecanico.name,
      }));

      // Format auto info (handle null values)
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
        manoDeObraPagada,
      };
    });
    return result;
  }

  async execute(dto: GastoDto) {
    const { from, to, decodedToken } = dto;
    const user = await this.usuarioRepository.findById(dto.decodedToken.userId);
    if (!user || !user.rol) {
      throw new Error("Usuario no tiene rol asignado");
    }

    const gastos =
      await this.gastoService.getGastoMecanicosUltimaSemanaCompartida(dto);
    return this.processGastos(gastos);
  }
}
