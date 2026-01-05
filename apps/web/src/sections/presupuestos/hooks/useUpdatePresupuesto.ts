import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdatePresupuesto = (presupuestoId: number) => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePresupuesto = async (body: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/presupuestos/${presupuestoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el presupuesto");
      }

      const result = await response.json();
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return {
    updatePresupuesto,
    loading,
    error,
  };
};
