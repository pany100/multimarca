import { EstadisticasBalanceVO } from "@/core/domain/value-objects/estadisticas-balance.vo";
import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { BalanceGeneralDto, GetAutosDto } from "../dto/estadisticas.dto";

export class EstadisticasVOMapper {
  constructor() {}

  static getAutosToVo(dto: GetAutosDto) {
    return new EstadisticasBaseVO(dto.año?.toString(), dto.mes?.toString());
  }

  static getBalanceGeneralToVo(dto: BalanceGeneralDto) {
    return new EstadisticasBalanceVO(
      new EstadisticasBaseVO(dto.año?.toString(), dto.mes?.toString()),
      dto.moneda || "ARS"
    );
  }
}
