import { GastoDto } from "../../dto/gasto.dto";
import { UltimaSemanaCompartidaUseCase } from "./ultima-semana-compartida.use-case";
import { UltimaSemanaUseCase } from "./ultima-semana.use-case";

export class GetTotalManoObraUltimaSemanaUseCase {
  constructor(
    private readonly ultimaSemanaUseCase: UltimaSemanaUseCase,
    private readonly ultimaSemanaCompartidaUseCase: UltimaSemanaCompartidaUseCase
  ) {}

  async execute(dto: GastoDto): Promise<{ totalManoObraSemana: number }> {
    const [porMecanico, compartida] = await Promise.all([
      this.ultimaSemanaUseCase.execute(dto),
      this.ultimaSemanaCompartidaUseCase.execute(dto),
    ]);

    const totalPorMecanico = (porMecanico as any[]).reduce(
      (sum, m) => sum + (Number(m.manoDeObraTotal) || 0),
      0
    );
    const totalCompartida = (compartida as any[]).reduce(
      (sum, r) => sum + (Number(r.manoDeObraTotal) || 0),
      0
    );

    return {
      totalManoObraSemana: totalPorMecanico + totalCompartida,
    };
  }
}
