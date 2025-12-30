import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

export const useOrdenReparacion = (id: string) => {
  const { authFetch } = useFetch();
  const [ordenReparacion, setOrdenReparacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdenReparacion = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`/api/orden-reparacion/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrdenReparacion(data);
          setError(null);
        } else {
          setError("Error al obtener la orden de reparación");
          console.error("Error al obtener la orden de reparación");
        }
      } catch (err) {
        setError("Error al obtener la orden de reparación");
        console.error("Error al obtener la orden de reparación:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrdenReparacion();
    }
  }, [id, authFetch]);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/orden-reparacion/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrdenReparacion(data);
        setError(null);
      }
    } catch (err) {
      setError("Error al obtener la orden de reparación");
      console.error("Error al obtener la orden de reparación:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    ordenReparacion,
    loading,
    error,
    refetch,
  };
};
