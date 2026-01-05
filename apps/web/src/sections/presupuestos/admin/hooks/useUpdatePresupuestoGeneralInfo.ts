import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useUpdatePresupuestoGeneralInfo = () => {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const updatePresupuestoGeneralInfo = async (
    presupuestoId: number,
    data: {
      autoId?: number | null;
      estado?: string;
      fechaEnvio?: string | null;
      fechaRespuesta?: string | null;
      informacionAuto?: string;
      informacionCliente?: string;
      observacionesCliente?: string;
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
        throw new Error(errorData.error || "Error al actualizar el presupuesto");
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
    updatePresupuestoGeneralInfo,
    loading,
  };
};
