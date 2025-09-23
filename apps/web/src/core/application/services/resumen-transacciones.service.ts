import { DateRangeVO } from "@/core/domain/value-objects/date-range.vo";
import { ResumenTransaccionesVO } from "@/core/domain/value-objects/resumen-transacciones.vo";
import { ResumenTransaccionesQueriesService } from "@/core/infrastructure/database/queries/resumen-transacciones-queries.service";
import { GetResumenesDto } from "../dto/resumen.dto";

export class ResumenTransaccionesService {
  constructor(
    private readonly resumenTransaccionesQueriesService: ResumenTransaccionesQueriesService
  ) {}

  async getResumenTransacciones(dto: GetResumenesDto) {
    const resumenTransaccionesVO = new ResumenTransaccionesVO(
      dto.page,
      dto.size,
      dto.query,
      dto.tipoOperacionId,
      new DateRangeVO(dto.from, dto.to)
    );
    return await this.resumenTransaccionesQueriesService.getResumenTransacciones(
      resumenTransaccionesVO
    );
  }
}
