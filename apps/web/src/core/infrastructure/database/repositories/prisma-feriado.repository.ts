import type { FeriadoRepository } from "@/core/domain/repositories/feriado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  getBuenosAiresDayRangeUtc,
  TURNOS_TIMEZONE,
} from "@/lib/turno-fecha-tz";
import { formatInTimeZone } from "date-fns-tz";

export class PrismaFeriadoRepository implements FeriadoRepository {
  async existsByFecha(fecha: Date): Promise<boolean> {
    const ymd = formatInTimeZone(fecha, TURNOS_TIMEZONE, "yyyy-MM-dd");
    const range = getBuenosAiresDayRangeUtc(ymd);
    if (!range) return false;

    const feriado = await prisma.feriado.findFirst({
      where: {
        fecha: {
          gte: range.gte,
          lte: range.lte,
        },
      },
    });
    return feriado != null;
  }
}
