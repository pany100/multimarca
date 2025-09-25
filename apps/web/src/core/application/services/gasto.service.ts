import { GastoRepository } from "@/core/domain/repositories/gasto.repository";
import { DateRangeVO } from "@/core/domain/value-objects/date-range.vo";
import { GastoDto } from "../dto/gasto.dto";

export class GastoService {
  constructor(private readonly gastoRepository: GastoRepository) {}

  async getGastoMecanicosUltimaSemana(dto: GastoDto) {
    const dateRangeVO = new DateRangeVO(dto.from, dto.to).toMandatoryDate();
    return await this.gastoRepository.getGastoMecanicosUltimaSemana(
      dateRangeVO.from,
      dateRangeVO.to
    );
  }

  async getGastoMecanicosUltimaSemanaCompartida(dto: GastoDto) {
    const dateRangeVO = new DateRangeVO(dto.from, dto.to).toMandatoryDate();
    return await this.gastoRepository.getGastoMecanicosUltimaSemanaCompartida(
      dateRangeVO.from,
      dateRangeVO.to
    );
  }
}
