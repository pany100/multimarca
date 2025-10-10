import React, { useState } from "react";
import useCalendar from "../hooks/useCalendar";
import useFeriados from "../hooks/useFeriados";
import useRecordatorios, {
  RecordatorioAgenda,
} from "../hooks/useRecordatorios";

type CalendarContextType = {
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  calendarGrid: (Date | null)[][];
  recordatorios: RecordatorioAgenda[];
  createRecordatorio: (
    recordatorioData: Omit<RecordatorioAgenda, "id">
  ) => Promise<void>;
  updateRecordatorio: (recordatorioData: RecordatorioAgenda) => Promise<void>;
  deleteRecordatorio: (id: number) => Promise<void>;
  getRecordatoriosForDay: (day: Date) => RecordatorioAgenda[];
  feriados: { id: number; fecha: string; descripcion: string }[];
  getFeriadoDescripcion: (day: Date) => string;
  isFeriado: (day: Date) => boolean;
};

const CalendarContext = React.createContext<CalendarContextType | null>(null);

type CalendarProviderProps = {
  children: React.ReactNode;
  general: boolean;
};

export const CalendarProvider = ({
  children,
  general,
}: CalendarProviderProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { calendarGrid } = useCalendar({ currentMonth });
  const {
    recordatorios,
    createRecordatorio,
    updateRecordatorio,
    deleteRecordatorio,
    getRecordatoriosForDay,
  } = useRecordatorios({ currentMonth, general });

  const { feriados, getFeriadoDescripcion, isFeriado } = useFeriados({
    currentMonth,
  });
  return (
    <CalendarContext.Provider
      value={{
        currentMonth,
        setCurrentMonth,
        calendarGrid,
        recordatorios,
        createRecordatorio,
        updateRecordatorio,
        deleteRecordatorio,
        getRecordatoriosForDay,
        feriados,
        getFeriadoDescripcion,
        isFeriado,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = React.useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider"
    );
  }
  return context;
};
