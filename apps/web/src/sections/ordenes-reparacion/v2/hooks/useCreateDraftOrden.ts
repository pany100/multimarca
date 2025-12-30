import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface CreateDraftOrdenData {
  autoId: number;
  kilometros?: number | null;
  observacionesCliente: string;
}

export const useCreateDraftOrden = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const createDraftOrden = async (data: CreateDraftOrdenData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch("/api/orden-reparacion/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la orden");
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
    createDraftOrden,
    loading,
    error,
  };
};
