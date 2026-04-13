import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useVentaRequired } from "../contexts/VentaContext";

export interface AjustePrecio {
  id: number;
  descripcion: string;
  monto: number;
  tipo: "porcentual" | "fijo";
  esDescuento: boolean;
  esInterno: boolean;
  orden: number;
}

interface AjustePrecioData {
  descripcion: string;
  monto: number;
  tipo: "porcentual" | "fijo";
  esDescuento: boolean;
  esInterno: boolean;
  orden: number;
}

export const useAjustesPrecioVentaManager = () => {
  const { authFetch } = useFetch();
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ajusteToDelete, setAjusteToDelete] = useState<AjustePrecio | null>(
    null,
  );

  const refreshVenta = async () => {
    const response = await authFetch(`/api/ventas/${venta.id}`);
    const ventaActualizada = await response.json();
    setVenta(ventaActualizada);
  };

  const handleAdd = async (data: AjustePrecioData) => {
    setLoading(true);
    try {
      const response = await authFetch("/api/ajuste-precio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventaId: venta.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al agregar ajuste de precio");
      }

      await refreshVenta();

      setSnackbar({
        open: true,
        message: "Ajuste de precio agregado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar ajuste de precio",
        severity: "error",
      });
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

      await refreshVenta();

      setSnackbar({
        open: true,
        message: "Ajuste de precio actualizado correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar ajuste de precio",
        severity: "error",
      });
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

      await refreshVenta();

      setSnackbar({
        open: true,
        message: "Ajuste de precio eliminado correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar ajuste de precio",
        severity: "error",
      });
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
