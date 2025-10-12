import { useFetch } from "@/contexts/FetchContext";
import { TypeOfOperation } from "@/core/application/services/agenda.service";
import { isSameDay } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  currentMonth: Date;
  general: boolean;
};

export interface RecordatorioAgenda {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha: Date;
  hecho: boolean;
  recurrence?: string;
  fechaFinRecurrencia?: Date | null;
}

function useRecordatorios({ currentMonth, general }: Props) {
  const { authFetch } = useFetch();
  const [recordatorios, setRecordatorios] = useState<RecordatorioAgenda[]>([]);
  const [refreshRecordatorios, setRefreshRecordatorios] = useState(false);

  const forceRefreshRecordatorios = () => {
    setRefreshRecordatorios((prev) => !prev);
  };

  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() es 0-indexed

        const response = await authFetch(
          `/api/agenda?general=${general}&year=${year}&month=${month}`
        );
        const data = await response.json();

        if (response.ok) {
          setRecordatorios(data.items);
        } else {
          throw new Error(data.error || "Error al cargar recordatorios");
        }
      } catch (error) {
        throw error;
      }
    };

    fetchRecordatorios();
  }, [currentMonth, general, authFetch, refreshRecordatorios]);

  const createRecordatorio = async (
    recordatorioData: Omit<RecordatorioAgenda, "id">
  ) => {
    const response = await authFetch(`/api/agenda?general=${general}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordatorioData),
    });
    const data = await response.json();

    if (response.ok) {
      setRecordatorios([...recordatorios, data]);
    } else {
      throw new Error(data.error || "Error al crear recordatorio");
    }
  };

  const updateRecordatorio = async (
    recordatorioData: RecordatorioAgenda,
    typeOfUpdate: TypeOfOperation
  ) => {
    const response = await authFetch(
      `/api/agenda/${recordatorioData.id}?typeOfUpdate=${typeOfUpdate}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordatorioData),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar recordatorio");
    }
  };

  const deleteRecordatorio = async (
    id: number,
    typeOfDelete: TypeOfOperation,
    refDate: Date
  ) => {
    try {
      const response = await authFetch(
        `/api/agenda/${id}?typeOfDelete=${typeOfDelete}&refDate=${refDate}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar recordatorio");
      }
    } catch (error) {
      throw error;
    }
  };

  const getRecordatoriosForDay = (day: Date) => {
    return recordatorios.filter((recordatorio) => {
      const recordatorioDate = new Date(recordatorio.fecha);
      return isSameDay(recordatorioDate, day);
    });
  };

  return {
    recordatorios,
    createRecordatorio,
    updateRecordatorio,
    deleteRecordatorio,
    getRecordatoriosForDay,
    forceRefreshRecordatorios,
  };
}

export default useRecordatorios;
