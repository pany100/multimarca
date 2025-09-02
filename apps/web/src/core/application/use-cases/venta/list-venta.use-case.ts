import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { normalizePageSize } from "@/shared/utils/pagination";
import { ListVentasQueryDto } from "../../dto/venta.dto";

export class ListVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(params: ListVentasQueryDto) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    return this.repo.listPaged({
      ...params,
      query: params.query ?? "",
      page,
      size,
    });
  }
}
