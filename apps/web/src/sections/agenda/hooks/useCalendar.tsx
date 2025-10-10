import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from "date-fns";

type Props = {
  currentMonth: Date;
};
function useCalendar({ currentMonth }: Props) {
  // Generar días del mes actual y añadir días de relleno para el inicio del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Generar array con todos los días del mes
  const allDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Crear un array para representar el calendario completo con las posiciones correctas
  const calendarGrid: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = Array(7).fill(null); // 7 días por semana (incluyendo fines de semana)
  let currentWeekIndex = 0;

  // Procesar todos los días del mes
  allDaysInMonth.forEach((day) => {
    const dayOfWeek = getDay(day);

    // Convertir día de la semana a índice de 0-6 (domingo-sábado)
    // 0 (domingo) -> 0, 1 (lunes) -> 1, ..., 6 (sábado) -> 6
    const weekdayIndex = dayOfWeek;

    // Si estamos en una nueva semana, añadir la semana anterior al grid y crear una nueva
    if (weekdayIndex < currentWeekIndex) {
      calendarGrid.push([...currentWeek]);
      currentWeek = Array(7).fill(null);
      currentWeekIndex = 0;
    }

    // Actualizar el índice de la semana actual
    currentWeekIndex = weekdayIndex + 1;

    // Colocar el día en la posición correcta de la semana
    currentWeek[weekdayIndex] = day;
  });
  calendarGrid.push([...currentWeek]);
  return { calendarGrid };
}

export default useCalendar;
