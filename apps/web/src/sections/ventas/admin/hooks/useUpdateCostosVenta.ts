import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface AjustePrecioDto {
  descripcion: string;
  monto: number;
  tipo: "porcentual" | "fijo";
  esDescuento: boolean;
  esInterno: boolean;
  orden: number;
}

interface UpdateCostosDto {
  ajustesPrecio?: AjustePrecioDto[];
  modoAjustes?: "acumulativo" | "sobreTotalBase";
}

export const useUpdateCostosVenta = () => {
  const [loading, setLoading] = useState(false);
  const { authFetch } = useFetch();

  const updateCostos = async (ventaId: number, data: UpdateCostosDto) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/ventas/${ventaId}`, {
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
