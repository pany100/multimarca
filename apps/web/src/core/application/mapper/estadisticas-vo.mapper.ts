import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { GetAutosDto } from "../dto/estadisticas.dto";

export class EstadisticasVOMapper {
  constructor() {}

  static getAutosToVo(dto: GetAutosDto) {
    return new EstadisticasBaseVO(dto.año?.toString(), dto.mes?.toString());
  }
}
