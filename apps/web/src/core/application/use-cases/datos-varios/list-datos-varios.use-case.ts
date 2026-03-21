import { DatosVariosRepository } from "@/core/domain/repositories/datos-varios.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListDatosVariosUseCase {
  constructor(private readonly repo: DatosVariosRepository) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
  }) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });

    return this.repo.listPaged({
      page,
      size,
      query: params.query ?? "",
    });
  }
}
