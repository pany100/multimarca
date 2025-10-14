import { useFetch } from "@/contexts/FetchContext";
import { Empleado } from "@prisma/client";
import { useEffect, useState } from "react";

function useEmpleadoFetcher(id: string) {
  const { authFetch } = useFetch();

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpleado = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`/api/mecanicos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEmpleado(data);
        } else {
          console.error("Error al obtener el empleado");
        }
      } catch (error) {
        console.error("Error al obtener el empleado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [id]);

  return {
    empleado,
    loading,
  };
}

export default useEmpleadoFetcher;
