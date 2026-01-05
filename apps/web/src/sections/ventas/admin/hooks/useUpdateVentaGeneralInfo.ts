import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";

export const useUpdateVentaGeneralInfo = () => {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);

  const updateVentaGeneralInfo = async (
    id: number,
    data: {
      clienteId?: number | null;
      informacionCliente?: string | null;
      estado?: string;
      fecha?: string | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/ventas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: data.clienteId,
          informacionCliente: data.informacionCliente,
          estado: data.estado,
          fecha: data.fecha ? new Date(data.fecha).toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la venta");
      }

      const ventaActualizada = await response.json();
      return ventaActualizada;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar la información",
        severity: "error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateVentaGeneralInfo, loading };
};
