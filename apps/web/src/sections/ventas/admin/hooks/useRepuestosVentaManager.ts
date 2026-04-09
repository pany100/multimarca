import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useVentaRequired } from "../contexts/VentaContext";

interface RepuestoUsado {
  id: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  stock: {
    id: number;
    nombre: string;
  };
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
}

export const useRepuestosVentaManager = () => {
  const { authFetch } = useFetch();
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [repuestoToDelete, setRepuestoToDelete] =
    useState<RepuestoUsado | null>(null);

  // Add repuesto usado
  const handleAddRepuesto = async (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/repuesto-usado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventaId: venta.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al agregar repuesto usado"
        );
      }

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

      setSnackbar({
        open: true,
        message: "Repuesto usado agregado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar repuesto usado",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update repuesto usado
  const handleUpdateRepuesto = async (
    id: number,
    data: {
      stockId?: number;
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/repuesto-usado/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al actualizar repuesto usado"
        );
      }

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

      setSnackbar({
        open: true,
        message: "Repuesto usado actualizado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar repuesto usado",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete repuesto usado
  const handleDeleteClick = (repuesto: RepuestoUsado) => {
    setRepuestoToDelete(repuesto);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!repuestoToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/repuesto-usado/${repuestoToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al eliminar repuesto usado"
        );
      }

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

      setSnackbar({
        open: true,
        message: "Repuesto usado eliminado correctamente",
        severity: "success",
      });

      setDeleteConfirmOpen(false);
      setRepuestoToDelete(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar repuesto usado",
        severity: "error",
      });

      setDeleteConfirmOpen(false);
      setRepuestoToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setRepuestoToDelete(null);
  };

  return {
    loading,
    handleAddRepuesto,
    handleUpdateRepuesto,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
