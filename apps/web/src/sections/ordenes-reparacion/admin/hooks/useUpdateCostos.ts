import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface UpdateCostosDto {
  incrementoInterno?: number | null;
  descuento?: number | null;
  descripcionDescuento?: string | null;
  incremento?: number | null;
  descripcionIncremento?: string | null;
}

export const useUpdateCostos = () => {
  const [loading, setLoading] = useState(false);
  const { authFetch } = useFetch();

  const updateCostos = async (ordenId: number, data: UpdateCostosDto) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/orden-reparacion/v2/${ordenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los costos");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error al actualizar costos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCostos,
    loading,
  };
};
