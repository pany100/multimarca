import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

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
    return this.repo.listPaged({
      page,
      size,
      query: params.query ?? "",
      estado: params.estado ?? undefined,
    });
  }
}
