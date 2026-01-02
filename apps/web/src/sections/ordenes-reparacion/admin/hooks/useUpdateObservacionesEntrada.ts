import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdateObservacionesEntrada = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateObservacionesEntrada = async (
    ordenId: number,
    observacionesEntrada: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observacionesEntrada,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar las observaciones de entrada");
      }

      const ordenActualizada = await response.json();
      return ordenActualizada;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateObservacionesEntrada, loading, error };
};
