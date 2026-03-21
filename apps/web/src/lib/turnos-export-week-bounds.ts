import { addDays, endOfDay, startOfWeek } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { TURNOS_TIMEZONE } from "./turno-fecha-tz";

export type ExportWeekBounds = {
  /** Inicio del lunes 00:00 en Argentina (como Date UTC para Prisma) */
  rangeStart: Date;
  /** Fin del viernes 23:59:59.999 en Argentina */
  rangeEnd: Date;
  /** Lunes a viernes como fechas “pared” en AR (para encabezados y cruce con turnos) */
  weekDaysWall: Date[];
};

/**
 * Rango inclusivo para consultar turnos/feriados de la semana laboral (lun–vie)
 * en hora Argentina, sin perder el viernes por límites en UTC o medianoche.
 */
export function getTurnosExportWeekBounds(
  nextWeek: boolean,
  referenceUtc: Date = new Date()
): ExportWeekBounds {
  const zonedNow = toZonedTime(referenceUtc, TURNOS_TIMEZONE);
  let mondayWall = startOfWeek(zonedNow, { weekStartsOn: 1 });
  if (nextWeek) {
    mondayWall = addDays(mondayWall, 7);
  }

  const rangeStart = fromZonedTime(mondayWall, TURNOS_TIMEZONE);
  const fridayWall = addDays(mondayWall, 4);
  const fridayEndWall = endOfDay(fridayWall);
  const rangeEnd = fromZonedTime(fridayEndWall, TURNOS_TIMEZONE);

  const weekDaysWall = Array.from({ length: 5 }, (_, i) =>
    addDays(mondayWall, i)
  );

  return { rangeStart, rangeEnd, weekDaysWall };
}

/** Misma clave de día civil que usamos para columnas del PDF y filtros. */
export function turnoFechaKeyInTz(fecha: Date): string {
  return formatInTimeZone(fecha, TURNOS_TIMEZONE, "yyyy-MM-dd");
}
