import { addDays, endOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
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
  const ymd = formatInTimeZone(referenceUtc, TURNOS_TIMEZONE, "yyyy-MM-dd");
  const [y, mo, d] = ymd.split("-").map(Number);
  const isoDay = Number(formatInTimeZone(referenceUtc, TURNOS_TIMEZONE, "i"));
  const todayMidnightUtc = new Date(y, mo - 1, d, 0, 0, 0, 0);
  let mondayCal = addDays(todayMidnightUtc, -(isoDay - 1));
  if (nextWeek) {
    mondayCal = addDays(mondayCal, 7);
  }

  const rangeStart = fromZonedTime(
    new Date(
      mondayCal.getFullYear(),
      mondayCal.getMonth(),
      mondayCal.getDate(),
      0,
      0,
      0,
      0
    ),
    TURNOS_TIMEZONE
  );

  const fridayCal = addDays(mondayCal, 4);
  const rangeEnd = fromZonedTime(
    endOfDay(
      new Date(
        fridayCal.getFullYear(),
        fridayCal.getMonth(),
        fridayCal.getDate(),
        0,
        0,
        0,
        0
      )
    ),
    TURNOS_TIMEZONE
  );

  const weekDaysWall = Array.from({ length: 5 }, (_, i) => {
    const day = addDays(mondayCal, i);
    return fromZonedTime(
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0),
      TURNOS_TIMEZONE
    );
  });

  return { rangeStart, rangeEnd, weekDaysWall };
}

/** Misma clave de día civil que usamos para columnas del PDF y filtros. */
export function turnoFechaKeyInTz(fecha: Date): string {
  return formatInTimeZone(fecha, TURNOS_TIMEZONE, "yyyy-MM-dd");
}
