import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface CreateDraftPresupuestoData {
  autoId?: number | null;
  informacionAuto?: string;
  informacionCliente?: string;
  observacionesCliente: string;
}

export const useCreateDraftPresupuesto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const createDraftPresupuesto = async (data: CreateDraftPresupuestoData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        estado: "EnPreparacion",
        fecha: new Date().toISOString(),
        repuestosUsados: [],
        reparacionesDeTercero: [],
        trabajosRealizados: [],
      };

      const response = await authFetch("/api/presupuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el presupuesto");
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
    createDraftPresupuesto,
    loading,
    error,
  };
};
