import { AcreedoresQueriesService } from "@/core/infrastructure/database/queries/acreedores-queries.service";
import { normalizePageSize } from "@/shared/utils/pagination";
import { ListAcreedoresDto } from "../../dto/cliente.dto";

export class GetAcreedoresUseCase {
  constructor(private acreedoresQueriesService: AcreedoresQueriesService) {}
  execute(dto: ListAcreedoresDto): Promise<any> {
    const { page, size } = normalizePageSize(dto.page, dto.size, {
      defaultSize: 10,
    });
    return this.acreedoresQueriesService.listTopAcreedores({
      page,
      size,
      query: dto.query || "",
      from: dto.from,
      to: dto.to,
    });
  }
}
