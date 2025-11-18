import { UnitOfWork } from "@/core/domain/ports/uow.port";
import type {
  AgendaRepository,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";
import { RecordatorioAgenda, Recurrence } from "@prisma/client";

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
      if (recordatorio.recurrence === Recurrence.No) {
        return this.repo.update(id, data);
      }
      return this.uow.run(async (tx) => {
        const newEventData = data as CreateAgendaInput;
        const { id, ...rest } = recordatorio;
        const nuevoRecordatorio = await this.repo.create(
          {
            ...rest,
            ...newEventData,
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
        return nuevoRecordatorio;
      });
    } else {
      // this_and_following
      const newEventData = data as CreateAgendaInput;

      return this.uow.run(async (tx) => {
        const excepcionesExistentes =
          await this.repo.findExceptionsByRecordatorioId(id);

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

        const excepcionesADuplicar = excepcionesExistentes.filter(
          (excepcion) => excepcion.fecha >= newEventData.fecha
        );

        for (const excepcion of excepcionesADuplicar) {
          await this.repo.createException(
            {
              recordatorioId: nuevoRecordatorio.id,
              fecha: excepcion.fecha,
            },
            { tx }
          );
        }

        return nuevoRecordatorio;
      });
    }
  }

  async delete(
    recordatorio: RecordatorioAgenda,
    typeOfDelete: TypeOfOperation,
    refDate: Date
  ) {
    if (typeOfDelete === "all") {
      return this.repo.delete(recordatorio.id);
    } else if (typeOfDelete === "this") {
      if (recordatorio.recurrence === Recurrence.No) {
        return this.repo.delete(recordatorio.id);
      }
      return this.repo.createException({
        recordatorioId: recordatorio.id,
        fecha: refDate,
      });
    } else {
      // this_and_following
      await this.repo.update(recordatorio.id, {
        fechaFinRecurrencia: new Date(refDate.getTime() - 24 * 60 * 60 * 1000),
      });
    }
  }
}
