import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useVenta } from "../contexts/VentaContext";

interface Mecanico {
  id: number;
  name: string;
  detalle?: string | null;
  mecanicoVentaId: number;
}

export const useMecanicoVentaManager = () => {
  const { authFetch } = useFetch();
  const { venta, setVenta } = useVenta();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mecanicoToDelete, setMecanicoToDelete] = useState<Mecanico | null>(
    null
  );

  const refreshVenta = async () => {
    const response = await authFetch(`/api/ventas/${venta.id}`);
    const ventaActualizada = await response.json();
    setVenta(ventaActualizada);
  };

  const handleAddMecanico = async (mecanicoId: number, detalle: string) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/venta-mecanico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventaId: venta.id,
          mecanicoId,
          detalle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al agregar mecánico");
      }

      await refreshVenta();

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

  const handleUpdateMecanico = async (
    mecanicoRelacionId: number,
    detalle: string
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/venta-mecanico/${mecanicoRelacionId}`,
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

      await refreshVenta();

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

  const handleDeleteClick = (mecanico: Mecanico) => {
    setMecanicoToDelete(mecanico);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mecanicoToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/venta-mecanico/${mecanicoToDelete.mecanicoVentaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar mecánico");
      }

      await refreshVenta();

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
