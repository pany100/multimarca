import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";

interface ReparacionTercero {
  id: number;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
  proveedor: {
    id: number;
    name: string;
  };
  recibo?: string | null;
}

export const useTercerosManager = () => {
  const { authFetch } = useFetch();
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [terceroToDelete, setTerceroToDelete] =
    useState<ReparacionTercero | null>(null);

  // Add reparacion tercero
  const handleAddTercero = async (data: {
    nombre: string;
    proveedorId: number;
    cantidad: number;
    precioCompra: number;
    precioVenta: number;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
    recibo?: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/reparacion-terceros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenReparacionId: orden.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al agregar reparación de tercero"
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
        message: "Reparación de tercero agregada correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar reparación de tercero",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update reparacion tercero
  const handleUpdateTercero = async (
    id: number,
    data: {
      nombre?: string;
      proveedorId?: number;
      cantidad?: number;
      precioCompra?: number;
      precioVenta?: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    }
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/reparacion-terceros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al actualizar reparación de tercero"
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
        message: "Reparación de tercero actualizada correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar reparación de tercero",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete reparacion tercero
  const handleDeleteClick = (tercero: ReparacionTercero) => {
    setTerceroToDelete(tercero);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!terceroToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/reparacion-terceros/${terceroToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al eliminar reparación de tercero"
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
        message: "Reparación de tercero eliminada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar reparación de tercero",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setTerceroToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTerceroToDelete(null);
  };

  return {
    loading,
    handleAddTercero,
    handleUpdateTercero,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
