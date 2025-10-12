import { UnitOfWork } from "@/core/domain/ports/uow.port";
import type {
  AgendaRepository,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";
import { Recurrence } from "@prisma/client";

export type TypeOfOperation = "this" | "this_and_following" | "all";

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

  async update(
    id: number,
    data: Partial<CreateAgendaInput>,
    typeOfUpdate: TypeOfOperation
  ) {
    const recordatorio = await this.findById(id);
    if (typeOfUpdate === "all") {
      if (recordatorio.recurrence === Recurrence.No) {
        return this.repo.update(id, data);
      } else {
        return this.repo.update(id, {
          titulo: data.titulo,
          descripcion: data.descripcion,
          hecho: data.hecho,
          fechaFinRecurrencia: data.fechaFinRecurrencia,
          recurrence: data.recurrence,
        });
      }
    } else if (typeOfUpdate === "this") {
      return this.uow.run(async (tx) => {
        const newEventData = data as CreateAgendaInput;
        const nuevoRecordatorio = await this.repo.create(newEventData, { tx });
        await this.repo.createException(
          {
            recordatorioId: id,
            fecha: newEventData.fecha,
          },
          { tx }
        );
        return nuevoRecordatorio;
      });
    } else {
      // this_and_following
      const newEventData = data as CreateAgendaInput;

      return this.uow.run(async (tx) => {
        await this.repo.update(
          id,
          {
            fechaFinRecurrencia: newEventData.fecha,
          },
          { tx }
        );
        await this.repo.createException(
          {
            recordatorioId: id,
            fecha: newEventData.fecha,
          },
          { tx }
        );
        const nuevoRecordatorio = await this.repo.create(newEventData, { tx });
        return nuevoRecordatorio;
      });
    }
  }

  async delete(id: number, typeOfDelete: TypeOfOperation) {
    const recordatorio = await this.findById(id);
    if (typeOfDelete === "all") {
      return this.repo.delete(id);
    } else if (typeOfDelete === "this") {
      return this.repo.createException({
        recordatorioId: id,
        fecha: recordatorio.fecha,
      });
    } else {
      // this_and_following
      await this.repo.update(id, {
        fechaFinRecurrencia: recordatorio.fecha,
      });
    }
  }
}
