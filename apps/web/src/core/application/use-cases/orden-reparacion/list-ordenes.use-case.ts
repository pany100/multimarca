import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { buildPageResult, normalizePageSize } from "@/shared/utils/pagination";

export class ListOrdenesUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
    estado?: string | null;
  }) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    const { items, total } = await this.repo.list({
      page,
      size,
      query: params.query ?? "",
      estado: params.estado ?? undefined,
    });
    return buildPageResult(items, total, page, size);
  }
}
