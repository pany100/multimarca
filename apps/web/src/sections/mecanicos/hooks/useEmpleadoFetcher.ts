import { useFetch } from "@/contexts/FetchContext";
import { Empleado } from "@prisma/client";
import { useEffect, useState } from "react";

function useEmpleadoFetcher(id: string) {
  const { authFetch } = useFetch();

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReparaciones, setLoadingReparaciones] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchEmpleado = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`/api/mecanicos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEmpleado(data);
        } else {
          throw new Error("Error al obtener el empleado");
        }
      } catch (error) {
        console.error("Error al obtener el empleado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [id, refreshTrigger]);

  const fetchReparaciones = async (start: Date, end: Date) => {
    setLoadingReparaciones(true);
    try {
      // Construct the URL with query parameters
      const url = `/api/mecanicos/${id}/reparaciones?from=${start.toISOString()}&to=${end.toISOString()}`;

      const response = await authFetch(url);

      if (!response.ok) {
        throw new Error("Error al obtener los datos");
      }

      return response.json();
    } catch (err) {
      throw err;
    } finally {
      setLoadingReparaciones(false);
    }
  };

  return {
    empleado,
    loading,
    loadingReparaciones,
    fetchReparaciones,
    refreshTrigger,
    setRefreshTrigger,
  };
}

export default useEmpleadoFetcher;
