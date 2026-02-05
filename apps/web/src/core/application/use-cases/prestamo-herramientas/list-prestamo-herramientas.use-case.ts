import { PrestamoHerramientasRepository } from "@/core/domain/repositories/prestamo-herramientas.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListPrestamoHerramientasUseCase {
  constructor(private readonly repo: PrestamoHerramientasRepository) {}

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
