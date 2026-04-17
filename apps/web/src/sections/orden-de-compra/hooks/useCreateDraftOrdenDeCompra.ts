import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface CreateDraftOrdenDeCompraData {
  fecha: string;
  proveedorId: number;
}

export const useCreateDraftOrdenDeCompra = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const createDraft = async (data: CreateDraftOrdenDeCompraData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch("/api/orden-de-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al crear la orden de compra",
        );
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

  return { createDraft, loading, error };
};
