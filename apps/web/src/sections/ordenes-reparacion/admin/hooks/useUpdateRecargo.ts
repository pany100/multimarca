import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

export const useUpdateRecargo = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setOrden } = useOrden();

  const updateRecargo = async (
    ordenId: number,
    data: {
      porcentajeRecargo?: number | null;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
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

      const ordenActualizada = await response.json();
      setOrden(ordenActualizada);
      return ordenActualizada;
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
