import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface CreateDraftVentaData {
  clienteId?: number | null;
  informacionCliente?: string;
  cedulaFilePath?: string | null;
  fecha: Date;
}

export const useCreateDraftVenta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const createDraftVenta = async (data: CreateDraftVentaData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        estado: "Borrador",
        fecha: data.fecha.toISOString(),
        repuestosUsados: [],
        reparacionesDeTercero: [],
        trabajosRealizados: [],
      };

      const response = await authFetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la venta");
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
    createDraftVenta,
    loading,
    error,
  };
};
