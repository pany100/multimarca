import { DeudoresQueriesService } from "@/core/infrastructure/database/queries/deudores-queries.service";
import { normalizePageSize } from "@/shared/utils/pagination";
import { ListDeudoresDto } from "../../dto/cliente.dto";

export class GetDeudoresUseCase {
  constructor(private deudoresQueriesService: DeudoresQueriesService) {}
  execute(dto: ListDeudoresDto): Promise<any> {
    const { page, size } = normalizePageSize(dto.page, dto.size, {
      defaultSize: 10,
    });
    return this.deudoresQueriesService.listTopDeudores({
      page,
      size,
      query: dto.query || "",
    });
  }
}
