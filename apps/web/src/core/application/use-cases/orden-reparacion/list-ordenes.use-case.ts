import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListOrdenesUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
    estado?: string | null;
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
      estado: params.estado ?? undefined,
      from: params.from ?? undefined,
      to: params.to ?? undefined,
    });
    const items = result.items.map((item) => {
      const comprobanteCalculado = ComprobanteCalculadoFactory.fromOrden(item);
      return {
        ...item,
        totalAPagar: comprobanteCalculado.total,
        totalPagado: comprobanteCalculado.totalPagado,
      };
    });
    return {
      ...result,
      items,
    };
  }
}
