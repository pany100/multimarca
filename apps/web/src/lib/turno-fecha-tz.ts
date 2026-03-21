import { endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

/** Zona usada en negocio (turnos, export semanal, feriados). */
export const TURNOS_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Rango UTC que cubre todo el día civil `yyyy-MM-dd` en Argentina (lista por fecha en pantalla).
 */
export function getBuenosAiresDayRangeUtc(ymdOrIso: string): {
  gte: Date;
  lte: Date;
} | null {
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymdOrIso.trim());
  if (!ymd) return null;
  const y = Number(ymd[1]);
  const mo = Number(ymd[2]);
  const d = Number(ymd[3]);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(d) ||
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31
  ) {
    return null;
  }
  const wall = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const gte = fromZonedTime(wall, TURNOS_TIMEZONE);
  const lte = fromZonedTime(endOfDay(wall), TURNOS_TIMEZONE);
  return { gte, lte };
}

/**
 * Convierte la fecha enviada por el cliente (típ. ISO o yyyy-MM-dd) en un instante UTC
 * estable: **mediodía** de ese día civil en Argentina.
 * Evita que `2025-03-21` se interprete como UTC (que en AR cae el día anterior) y
 * que el turno “salte” de día al listar o exportar.
 */
export function normalizeTurnoFechaInputToUtc(fechaInput: string): Date {
  const trimmed = fechaInput.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const y = Number(ymd[1]);
    const mo = Number(ymd[2]);
    const d = Number(ymd[3]);
    if (
      Number.isFinite(y) &&
      Number.isFinite(mo) &&
      Number.isFinite(d) &&
      mo >= 1 &&
      mo <= 12 &&
      d >= 1 &&
      d <= 31
    ) {
      return fromZonedTime(
        new Date(y, mo - 1, d, 12, 0, 0, 0),
        TURNOS_TIMEZONE
      );
    }
  }
  return new Date(fechaInput);
}
