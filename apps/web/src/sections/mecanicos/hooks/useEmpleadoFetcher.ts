import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function useEmpleadoFetcher(id: string) {
  const { authFetch } = useFetch();

  const [empleado, setEmpleado] = useState(null);

  useEffect(() => {
    const fetchEmpleado = async () => {
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
      }
    };

    fetchEmpleado();
  }, [id]);

  return {
    empleado,
  };
}

export default useEmpleadoFetcher;
