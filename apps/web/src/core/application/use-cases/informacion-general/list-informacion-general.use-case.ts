import { InformacionGeneralRepository } from "@/core/domain/repositories/informacion-general.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListInformacionGeneralUseCase {
  constructor(private readonly repo: InformacionGeneralRepository) {}

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
