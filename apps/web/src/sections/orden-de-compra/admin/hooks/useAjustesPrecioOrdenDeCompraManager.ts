import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { AjustePrecio } from "@/sections/ordenes-reparacion/admin/hooks/useAjustesPrecioManager";
import { useState } from "react";
import { useOrdenDeCompraContext } from "../contexts/OrdenDeCompraContext";

export type { AjustePrecio };

interface AjustePrecioData {
  descripcion: string;
  monto: number;
  tipo: "porcentual" | "fijo";
  esDescuento: boolean;
  esInterno: boolean;
  orden: number;
}

export const useAjustesPrecioOrdenDeCompraManager = () => {
  const { authFetch } = useFetch();
  const { orden, setOrden } = useOrdenDeCompraContext();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ajusteToDelete, setAjusteToDelete] = useState<AjustePrecio | null>(
    null,
  );

  const refreshOrden = async () => {
    const response = await authFetch(`/api/orden-de-compra/${orden.id}`);
    const ordenActualizada = await response.json();
    setOrden(ordenActualizada);
  };

  const notifyError = (error: any, fallback: string) => {
    setSnackbar({
      open: true,
      message: error?.message || fallback,
      severity: "error",
    });
  };

  const notifySuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: "success" });
  };

  const handleAdd = async (data: AjustePrecioData) => {
    setLoading(true);
    try {
      const response = await authFetch("/api/ajuste-precio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordenDeCompraId: orden.id, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al agregar ajuste de precio");
      }

      await refreshOrden();
      notifySuccess("Ajuste de precio agregado correctamente");
      return true;
    } catch (error: any) {
      notifyError(error, "Error al agregar ajuste de precio");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, data: Partial<AjustePrecioData>) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/ajuste-precio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al actualizar ajuste de precio",
        );
      }

      await refreshOrden();
      notifySuccess("Ajuste de precio actualizado correctamente");
      return true;
    } catch (error: any) {
      notifyError(error, "Error al actualizar ajuste de precio");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ajuste: AjustePrecio) => {
    setAjusteToDelete(ajuste);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ajusteToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/ajuste-precio/${ajusteToDelete.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar ajuste de precio");
      }

      await refreshOrden();
      notifySuccess("Ajuste de precio eliminado correctamente");
    } catch (error: any) {
      notifyError(error, "Error al eliminar ajuste de precio");
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setAjusteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setAjusteToDelete(null);
  };

  return {
    loading,
    handleAdd,
    handleUpdate,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
