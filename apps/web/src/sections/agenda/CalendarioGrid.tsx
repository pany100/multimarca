import CalendarioCell from "./CalendarioCell";
import CalendarioEmptyCell from "./CalendarioEmptyCell";
import { useCalendarContext } from "./contexts/CalendarContext";

function CalendarioGrid() {
  const { calendarGrid } = useCalendarContext();

  return (
    <>
      {calendarGrid.map((week, weekIndex) =>
        week.map((day, dayIndex) => {
          if (day === null) {
            return (
              <CalendarioEmptyCell key={`empty-${weekIndex}-${dayIndex}`} />
            );
          }
          return (
            <CalendarioCell key={`cell-${weekIndex}-${dayIndex}`} day={day} />
          );
        })
      )}
    </>
  );
}

export default CalendarioGrid;
