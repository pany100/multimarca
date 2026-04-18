import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";

export const useUpdateIngresoVenta = () => {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);

  const updateIngresoVenta = async (
    id: number,
    data: Record<string, any>
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/ingresos-ventas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el ingreso"
        );
      }

      return await response.json();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar",
        severity: "error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateIngresoVenta, loading };
};
