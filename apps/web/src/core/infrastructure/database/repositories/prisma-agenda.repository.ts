import type {
  AgendaRepository,
  CreateAgendaExceptionInput,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { buildPageResult } from "@/shared/utils/pagination";
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
    });
    const ocurrencias = rule.between(start, end);
    return ocurrencias.map((f) => ({
      ...evento,
      fecha: f,
      isOccurrence: true,
    }));
  }

  async list({
    page,
    size,
    query = "",
    month,
    year,
    onlyPending,
    general,
    userId,
  }: ListAgendaParams) {
    const where: any = {
      OR: [
        { titulo: { contains: query } },
        { descripcion: { contains: query } },
      ],
    };

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

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
                  { fechaFinRecurrencia: { gte: startDate } },
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

    const skip = page * size;
    const [items, total] = await Promise.all([
      prisma.recordatorioAgenda.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "asc" },
      }),
      prisma.recordatorioAgenda.count({ where }),
    ]);

    // Expandimos los recurrentes
    const expanded = items.flatMap((evento) =>
      this.expandirRecurrencia(evento, startDate, endDate)
    );

    expanded.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    return buildPageResult(expanded, expanded.length, page, size);
  }

  async create(input: CreateAgendaInput) {
    return prisma.recordatorioAgenda.create({ data: input });
  }

  async findById(id: number) {
    return prisma.recordatorioAgenda.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<CreateAgendaInput>) {
    return prisma.recordatorioAgenda.update({ where: { id }, data });
  }

  async delete(id: number) {
    await prisma.recordatorioAgenda.delete({ where: { id } });
  }

  async createException(params: CreateAgendaExceptionInput) {
    return prisma.recordatorioRecurrenteExcepciones.create({ data: params });
  }
}
