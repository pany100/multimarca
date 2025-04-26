import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useEffect, useState } from "react";

interface Feriado {
  id: number;
  fecha: string;
  descripcion: string;
}

export const useFeriados = () => {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const response = await authFetch("/api/feriados/in-the-future");
        const data = await response.json();
        setFeriados(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los feriados");
        console.error("Error fetching feriados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeriados();
  }, []);

  const isFeriado = useCallback(
    (date: Date) => {
      const dateString = date.toISOString().split("T")[0];
      return feriados.some((feriado) => feriado.fecha.startsWith(dateString));
    },
    [feriados]
  );

  return {
    feriados,
    loading,
    error,
    isFeriado,
  };
};

export default useFeriados;
