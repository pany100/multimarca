import { UnitOfWork } from "@/core/domain/ports/uow.port";
import type {
  AgendaRepository,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";

export class AgendaService {
  constructor(
    private readonly repo: AgendaRepository,
    private readonly uow: UnitOfWork
  ) {}

  list(params: ListAgendaParams) {
    return this.repo.list(params);
  }

  create(input: CreateAgendaInput) {
    return this.repo.create(input);
  }

  findById(id: number) {
    return this.repo.findById(id);
  }

  update(
    id: number,
    data: Partial<CreateAgendaInput> & {
      updatingRecurrentEvent: boolean;
    }
  ) {
    if (data.updatingRecurrentEvent) {
      return this.repo.update(id, data);
    } else {
      return this.uow.run(async (tx) => {
        const newEventData = data as CreateAgendaInput;
        const nuevoRecordatorio = await this.repo.create(newEventData);
        await this.repo.createException({
          recordatorioId: id,
          fecha: newEventData.fecha,
        });
        return nuevoRecordatorio;
      });
    }
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
