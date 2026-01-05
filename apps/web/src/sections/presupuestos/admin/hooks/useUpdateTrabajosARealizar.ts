import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdateTrabajosARealizar = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const updateTrabajosARealizar = async (
    presupuestoId: number,
    data: {
      detallesDeTrabajo?: string | null;
    }
  ) => {
    setLoading(true);

    try {
      const response = await authFetch(`/api/presupuestos/${presupuestoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar los trabajos");
      }

      const result = await response.json();
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return {
    updateTrabajosARealizar,
    loading,
  };
};
