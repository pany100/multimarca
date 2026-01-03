import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdateDetalles = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDetalles = async (ordenId: number, detalleControles: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ detalleControles }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar los detalles");
      }

      const ordenActualizada = await response.json();
      return ordenActualizada;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDetalles,
    loading,
    error,
  };
};
