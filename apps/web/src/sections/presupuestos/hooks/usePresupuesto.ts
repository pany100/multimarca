import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

export const usePresupuesto = (id: string) => {
  const { authFetch } = useFetch();
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresupuesto = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`/api/presupuestos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPresupuesto(data);
          setError(null);
        } else {
          setError("Error al obtener el presupuesto");
          console.error("Error al obtener el presupuesto");
        }
      } catch (err) {
        setError("Error al obtener el presupuesto");
        console.error("Error al obtener el presupuesto:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPresupuesto();
    }
  }, [id, authFetch]);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/presupuestos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPresupuesto(data);
        setError(null);
      }
    } catch (err) {
      setError("Error al obtener el presupuesto");
      console.error("Error al obtener el presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    presupuesto,
    loading,
    error,
    refetch,
  };
};
