import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListPerdidasUseCase {
  constructor(private readonly repo: PerdidaRepository) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
    from?: string | null;
    to?: string | null;
  }) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    
    const result = await this.repo.listPaged({
      page,
      size,
      query: params.query ?? "",
      from: params.from ?? undefined,
      to: params.to ?? undefined,
    });

    return result;
  }
}
