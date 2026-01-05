import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useVentaRequired } from "../contexts/VentaContext";

interface ReparacionTercero {
  id: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor: {
    id: number;
    name: string;
  };
  recibo?: string | null;
}

export const useTercerosVentaManager = () => {
  const { authFetch } = useFetch();
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [terceroToDelete, setTerceroToDelete] =
    useState<ReparacionTercero | null>(null);

  // Add reparacion tercero
  const handleAddTercero = async (data: {
    nombre: string;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    recibo?: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/reparacion-terceros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventaId: venta.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al agregar reparación de tercero"
        );
      }

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

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
      precioCompra?: number;
      precioVenta?: number;
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

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

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

      // Refresh venta data
      const ventaResponse = await authFetch(`/api/ventas/${venta.id}`);
      const ventaActualizada = await ventaResponse.json();
      setVenta(ventaActualizada);

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
