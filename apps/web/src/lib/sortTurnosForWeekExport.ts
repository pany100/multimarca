import { startOfDay } from "date-fns";

/** Convierte "HH:mm" o "H:mm" a minutos desde medianoche para ordenar. */
function horaToMinutes(hora: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(hora.trim());
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return 0;
  return h * 60 + min;
}

/**
 * Orden para PDF / export semanal: primero por día calendario (lun → vie),
 * dentro de cada día de más temprano a más tarde.
 */
export function sortTurnosByDayAndHora<
  T extends { fecha: Date; hora: string },
>(turnos: T[]): T[] {
  return [...turnos].sort((a, b) => {
    const dayDiff =
      startOfDay(a.fecha).getTime() - startOfDay(b.fecha).getTime();
    if (dayDiff !== 0) return dayDiff;
    return horaToMinutes(a.hora) - horaToMinutes(b.hora);
  });
}
