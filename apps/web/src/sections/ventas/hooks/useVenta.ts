import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

export const useVenta = (id: string) => {
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`/api/ventas/${id}`);

        if (!response.ok) {
          throw new Error("Error al cargar la venta");
        }

        const data = await response.json();
        setVenta(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenta();
    }
  }, [id, authFetch]);

  return { venta, loading, error };
};
