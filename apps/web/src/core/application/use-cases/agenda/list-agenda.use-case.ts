import { AgendaService } from "@/core/application/services/agenda.service";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListAgendaUseCase {
  constructor(private readonly service: AgendaService) {}

  async execute(params: {
    page?: number | string | null;
    size?: number | string | null;
    query?: string | null;
    month: number;
    year: number;
    onlyPending?: boolean;
    general: boolean;
    userId: number;
  }) {
    const { page, size } = normalizePageSize(params.page, params.size);
    const query = params.query ?? "";
    const month = Number(params.month);
    const year = Number(params.year);
    const onlyPending = !!params.onlyPending;
    return this.service.list({
      page,
      size,
      query,
      month,
      year,
      onlyPending,
      general: params.general,
      userId: params.userId,
    });
  }
}
