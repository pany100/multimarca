import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

interface Mecanico {
  id: number;
  name: string;
  detalle?: string | null;
  mecanicoOrdenRepId: number;
}

export const useMecanicoManager = () => {
  const { authFetch } = useFetch();
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mecanicoToDelete, setMecanicoToDelete] = useState<Mecanico | null>(
    null
  );

  // Add mecanico
  const handleAddMecanico = async (mecanicoId: number, detalle: string) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/orden-reparacion-mecanico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenReparacionId: orden.id,
          mecanicoId,
          detalle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al agregar mecánico");
      }

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Mecánico agregado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar mecánico",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update mecanico detalle
  const handleUpdateMecanico = async (
    mecanicoRelacionId: number,
    detalle: string
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-reparacion-mecanico/${mecanicoRelacionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ detalle }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar mecánico");
      }

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Mecánico actualizado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar mecánico",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete mecanico
  const handleDeleteClick = (mecanico: Mecanico) => {
    setMecanicoToDelete(mecanico);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mecanicoToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-reparacion-mecanico/${mecanicoToDelete.mecanicoOrdenRepId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar mecánico");
      }

      // Refresh orden data
      const ordenResponse = await authFetch(
        `/api/orden-reparacion/${orden.id}`
      );
      const ordenActualizada = await ordenResponse.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Mecánico eliminado correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar mecánico",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setMecanicoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setMecanicoToDelete(null);
  };

  return {
    loading,
    handleAddMecanico,
    handleUpdateMecanico,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
