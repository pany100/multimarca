import type {
  AgendaRepository,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";

export class AgendaService {
  constructor(private readonly repo: AgendaRepository) {}

  list(params: ListAgendaParams) {
    return this.repo.list(params);
  }

  create(input: CreateAgendaInput) {
    return this.repo.create(input);
  }
}
