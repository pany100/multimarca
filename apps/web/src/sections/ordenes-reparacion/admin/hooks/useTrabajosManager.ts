import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

interface TrabajoRealizado {
  id: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number | null;
  pdfName?: string | null;
}

export const useTrabajosManager = () => {
  const { authFetch } = useFetch();
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trabajoToDelete, setTrabajoToDelete] =
    useState<TrabajoRealizado | null>(null);

  // Add trabajo realizado
  const handleAddTrabajo = async (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number | null;
    pdfName?: string | null;
    manoDeObra?: { name: string };
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/trabajo-realizado`, {
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
            "Error al agregar trabajo realizado"
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
        message: "Trabajo realizado agregado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar trabajo realizado",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update trabajo realizado
  const handleUpdateTrabajo = async (
    id: number,
    data: {
      precioUnitario?: number;
      descripcion?: string;
      diasParaRecordatorio?: number | null;
      pdfName?: string | null;
      manoDeObra?: { name: string };
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/trabajo-realizado/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al actualizar trabajo realizado"
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
        message: "Trabajo realizado actualizado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar trabajo realizado",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete trabajo realizado
  const handleDeleteClick = (trabajo: TrabajoRealizado) => {
    setTrabajoToDelete(trabajo);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!trabajoToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/trabajo-realizado/${trabajoToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Error al eliminar trabajo realizado"
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
        message: "Trabajo realizado eliminado correctamente",
        severity: "success",
      });

      setDeleteConfirmOpen(false);
      setTrabajoToDelete(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar trabajo realizado",
        severity: "error",
      });

      setDeleteConfirmOpen(false);
      setTrabajoToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTrabajoToDelete(null);
  };

  return {
    loading,
    handleAddTrabajo,
    handleUpdateTrabajo,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
