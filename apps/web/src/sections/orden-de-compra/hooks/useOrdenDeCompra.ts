import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useEffect, useState } from "react";

export const useOrdenDeCompra = (id: string) => {
  const [orden, setOrden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const fetchOrden = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/orden-de-compra/${id}`);

      if (!response.ok) {
        throw new Error("Error al cargar la orden de compra");
      }

      const data = await response.json();
      setOrden(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [id, authFetch]);

  useEffect(() => {
    if (id) {
      fetchOrden();
    }
  }, [id, fetchOrden]);

  return { orden, loading, error, refetch: fetchOrden };
};
