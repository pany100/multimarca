import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TareaDiaria, TareasAgrupadasPorFecha } from "../types/TareaDiaria";

/**
 * Agrupa las tareas por fecha
 */
export const agruparTareasPorFecha = (
  tareas: TareaDiaria[]
): TareasAgrupadasPorFecha => {
  return tareas.reduce((agrupadas: TareasAgrupadasPorFecha, tarea) => {
    const fechaFormateada = format(parseISO(tarea.fecha), "yyyy-MM-dd");

    if (!agrupadas[fechaFormateada]) {
      agrupadas[fechaFormateada] = [];
    }

    agrupadas[fechaFormateada].push(tarea);
    return agrupadas;
  }, {});
};

/**
 * Verifica si todas las tareas de un día están completadas
 */
export const todasTareasCompletadas = (
  tareasDelDia: TareaDiaria[]
): boolean => {
  return tareasDelDia.every((tarea) => tarea.realizado);
};

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatearFecha = (fechaStr: string): string => {
  // Si es la fecha actual, mostrar "Hoy"
  const hoy = format(new Date(), "yyyy-MM-dd");

  if (fechaStr === hoy) {
    return "Hoy";
  }

  // Formatear la fecha en estilo español
  return format(parseISO(fechaStr), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
};

/**
 * Ordena las fechas de manera cronológica
 */
export const ordenarFechas = (fechas: string[]): string[] => {
  return fechas.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
};
