import type {
  AgendaRepository,
  CreateAgendaExceptionInput,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { Recurrence } from "@prisma/client";
import { RRule } from "rrule";

type Evento = {
  recurrence: Recurrence;
  general: boolean;
  userId: number | null;
  descripcion: string | null;
  titulo: string;
  fechaFinRecurrencia: Date | null;
  fecha: Date;
  hecho: boolean;
  id: number;
};

export class PrismaAgendaRepository implements AgendaRepository {
  private expandirRecurrencia(evento: Evento, start: Date, end: Date) {
    if (evento.recurrence === Recurrence.No) return [evento];
    const freqMap = {
      [Recurrence.Diario]: RRule.DAILY,
      [Recurrence.Semanal]: RRule.WEEKLY,
      [Recurrence.Mensual]: RRule.MONTHLY,
      [Recurrence.Anual]: RRule.YEARLY,
    } as const;
    const rule = new RRule({
      freq: freqMap[evento.recurrence],
      dtstart: new Date(evento.fecha),
      until: evento.fechaFinRecurrencia || end,
      tzid: "UTC",
    });
    const ocurrencias = rule.between(start, end, true);
    return ocurrencias.map((f) => ({
      ...evento,
      fecha: f,
      isOccurrence: true,
    }));
  }

  async list({ month, year, onlyPending, general, userId }: ListAgendaParams) {
    const where: any = {};

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    where.AND = [
      {
        OR: [
          {
            AND: [
              { fecha: { gte: startDate, lte: endDate } },
              { recurrence: Recurrence.No },
            ],
          },
          {
            AND: [
              {
                OR: [
                  { fechaFinRecurrencia: { gt: startDate } },
                  { fechaFinRecurrencia: null },
                ],
              },
              { recurrence: { not: Recurrence.No } },
            ],
          },
        ],
      },
    ];

    if (onlyPending) where.hecho = false;

    if (general) {
      where.general = true;
    } else {
      where.general = false;
      where.userId = userId;
    }
    const [items, total, exceptions] = await Promise.all([
      prisma.recordatorioAgenda.findMany({
        where,
        orderBy: { fecha: "asc" },
      }),
      prisma.recordatorioAgenda.count({ where }),
      this.findExceptionsByDate(startDate, endDate),
    ]);

    // Expandimos los recurrentes
    const expanded = items.flatMap((evento) =>
      this.expandirRecurrencia(evento, startDate, endDate)
    );
    console.log("#################################################");
    console.log("Expanded events:", expanded);
    console.log("Exceptions:", exceptions);
    const filtered = expanded.filter(
      (occ) =>
        !exceptions.some(
          (ex) =>
            ex.recordatorioId === occ.id &&
            ex.fecha.toDateString() === occ.fecha.toDateString()
        )
    );
    console.log("Filtered events:", filtered);
    console.log("#################################################");
    filtered.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    return { items: filtered, total };
  }

  async create(input: CreateAgendaInput, deps?: { tx?: any }) {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.recordatorioAgenda.create({ data: input });
  }

  async findById(id: number) {
    return prisma.recordatorioAgenda.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Partial<CreateAgendaInput>,
    deps?: { tx?: any }
  ) {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.recordatorioAgenda.update({ where: { id }, data });
  }

  async delete(id: number) {
    await prisma.recordatorioAgenda.delete({ where: { id } });
  }

  async createException(
    params: CreateAgendaExceptionInput,
    deps?: { tx?: any }
  ) {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.recordatorioRecurrenteExcepciones.create({ data: params });
  }

  async findExceptionsByDate(startDate: Date, endDate: Date) {
    return prisma.recordatorioRecurrenteExcepciones.findMany({
      where: { fecha: { gte: startDate, lte: endDate } },
    });
  }

  async findExceptionsByRecordatorioId(recordatorioId: number) {
    return prisma.recordatorioRecurrenteExcepciones.findMany({
      where: { recordatorioId },
    });
  }

  async listByDay({
    year,
    month,
    day,
    onlyPending,
  }: {
    year: number;
    month: number;
    day: number;
    onlyPending?: boolean;
  }) {
    const where: any = {};

    // Crear rango para un solo día en UTC
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // Buscar eventos que:
    // 1. Sean del día específico y no recurrentes
    // 2. Sean recurrentes y estén activos (sin fecha fin o con fecha fin posterior al día)
    where.AND = [
      {
        OR: [
          {
            AND: [
              { fecha: { gte: startDate, lte: endDate } },
              { recurrence: Recurrence.No },
            ],
          },
          {
            AND: [
              {
                OR: [
                  { fechaFinRecurrencia: { gt: startDate } },
                  { fechaFinRecurrencia: null },
                ],
              },
              { recurrence: { not: Recurrence.No } },
            ],
          },
        ],
      },
    ];

    if (onlyPending) where.hecho = false;

    const [items, exceptions] = await Promise.all([
      prisma.recordatorioAgenda.findMany({
        where,
        orderBy: { fecha: "asc" },
      }),
      this.findExceptionsByDate(startDate, endDate),
    ]);

    // Expandir los eventos recurrentes para el día específico
    const expanded = items.flatMap((evento) =>
      this.expandirRecurrencia(evento, startDate, endDate)
    );

    // Filtrar excepciones
    const filtered = expanded.filter(
      (occ) =>
        !exceptions.some(
          (ex) =>
            ex.recordatorioId === occ.id &&
            ex.fecha.toDateString() === occ.fecha.toDateString()
        )
    );

    filtered.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    return filtered;
  }
}
