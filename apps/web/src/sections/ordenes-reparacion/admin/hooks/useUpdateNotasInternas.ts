import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdateNotasInternas = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNotasInternas = async (
    ordenId: number,
    data: {
      observacionesOcultas?: string;
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
        throw new Error(errorData.error || "Error al actualizar las notas");
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
    updateNotasInternas,
    loading,
    error,
  };
};
