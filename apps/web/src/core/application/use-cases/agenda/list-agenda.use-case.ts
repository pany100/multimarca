import { AgendaService } from "@/core/application/services/agenda.service";

export class ListAgendaUseCase {
  constructor(private readonly service: AgendaService) {}

  async execute(params: {
    month: number;
    year: number;
    onlyPending?: boolean;
    general: boolean;
    userId: number;
  }) {
    const month = Number(params.month);
    const year = Number(params.year);
    const onlyPending = !!params.onlyPending;
    return this.service.list({
      month,
      year,
      onlyPending,
      general: params.general,
      userId: params.userId,
    });
  }
}
