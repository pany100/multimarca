import { useFetch } from "@/contexts/FetchContext";
import { isSameDay } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  currentMonth: Date;
};

function useFeriados({ currentMonth }: Props) {
  const { authFetch } = useFetch();
  // Estado para los feriados
  const [feriados, setFeriados] = useState<
    { id: number; fecha: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const response = await authFetch(
          `/api/feriados/monthly?year=${year}&month=${month}`
        );
        const data = await response.json();

        if (response.ok) {
          setFeriados(data);
        } else {
          throw new Error(data.error || "Error al cargar feriados");
        }
      } catch (error) {
        throw error;
      }
    };

    fetchFeriados();
  }, [currentMonth, authFetch]);

  const isFeriado = (day: Date) => {
    return feriados.some((feriado) => {
      const feriadoDate = new Date(feriado.fecha);
      return isSameDay(feriadoDate, day);
    });
  };

  const getFeriadoDescripcion = (day: Date) => {
    const feriado = feriados.find((feriado) => {
      const feriadoDate = new Date(feriado.fecha);
      return isSameDay(feriadoDate, day);
    });
    return feriado ? feriado.descripcion : "";
  };

  return { feriados, isFeriado, getFeriadoDescripcion };
}

export default useFeriados;
