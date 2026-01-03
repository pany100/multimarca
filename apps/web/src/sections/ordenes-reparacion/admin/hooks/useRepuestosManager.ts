import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

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
}

export const useRepuestosManager = () => {
  const { authFetch } = useFetch();
  const { orden, setOrden } = useOrden();
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
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/repuesto-usado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenReparacionId: orden.id,
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

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

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

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

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

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Repuesto usado eliminado correctamente",
        severity: "success",
      });

      setTimeout(() => {
        setDeleteConfirmOpen(false);
        setRepuestoToDelete(null);
      }, 100);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar repuesto usado",
        severity: "error",
      });

      setTimeout(() => {
        setDeleteConfirmOpen(false);
        setRepuestoToDelete(null);
      }, 100);
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
