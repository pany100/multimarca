import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdateRecargoVenta = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecargo = async (
    ventaId: number,
    data: {
      porcentajeRecargo?: number | null;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/ventas/${ventaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el recargo");
      }

      const ventaActualizada = await response.json();
      return ventaActualizada;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRecargo,
    loading,
    error,
  };
};
