import { useFetch } from "@/contexts/FetchContext";
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
  fecha: string;
  hecho: boolean;
  recurrence?: string;
}

function useRecordatorios({ currentMonth, general }: Props) {
  const { authFetch } = useFetch();
  const [recordatorios, setRecordatorios] = useState<RecordatorioAgenda[]>([]);

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
  }, [currentMonth, general, authFetch]);

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

  const updateRecordatorio = async (recordatorioData: RecordatorioAgenda) => {
    const response = await authFetch(`/api/agenda/${recordatorioData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordatorioData),
    });
    const data = await response.json();

    if (response.ok) {
      setRecordatorios(recordatorios.map((r) => (r.id === data.id ? data : r)));
    } else {
      throw new Error(data.error || "Error al actualizar recordatorio");
    }
  };

  const deleteRecordatorio = async (id: number) => {
    try {
      const response = await authFetch(`/api/agenda/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar la lista de recordatorios
        setRecordatorios(recordatorios.filter((r) => r.id !== id));
      } else {
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
  };
}

export default useRecordatorios;
