import { AgendaService } from "@/core/application/services/agenda.service";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListAgendaUseCase {
  constructor(private readonly service: AgendaService) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
    month?: number | string | null;
    year?: number | string | null;
    onlyPending?: boolean;
    general: boolean;
  }) {
    const { page, size } = normalizePageSize(params.page, params.size);
    const query = params.query ?? "";
    const month = params.month ? Number(params.month) : undefined;
    const year = params.year ? Number(params.year) : undefined;
    const onlyPending = !!params.onlyPending;
    return this.service.list({
      page,
      size,
      query,
      month,
      year,
      onlyPending,
      general: params.general,
    });
  }
}
