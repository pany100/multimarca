import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";
import { useUpdateDetalles } from "./useUpdateDetalles";

export const useDetallesManager = () => {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateDetalles, loading } = useUpdateDetalles();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Parse detalles from JSON string
  const detallesArray: string[] = orden?.detalleControles
    ? JSON.parse(orden.detalleControles)
    : [];

  // Helper to update detalles via PATCH
  const updateDetallesArray = async (newArray: string[]) => {
    try {
      const ordenActualizada = await updateDetalles(
        orden.id,
        JSON.stringify(newArray)
      );
      setOrden(ordenActualizada);
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar los detalles",
        severity: "error",
      });
      return false;
    }
  };

  // Handle add/edit submit
  const handleSubmit = async (detalle: string, editValue?: string) => {
    let newArray: string[];

    if (editValue) {
      // Edit: Replace the old value with the new one
      newArray = detallesArray.map((det) =>
        det === editValue ? detalle : det
      );
    } else {
      // Add: Append to the array
      newArray = [...detallesArray, detalle];
    }

    const success = await updateDetallesArray(newArray);
    if (success) {
      setSnackbar({
        open: true,
        message: editValue
          ? "Detalle actualizado correctamente"
          : "Detalle agregado correctamente",
        severity: "success",
      });
    }
    return success;
  };

  // Handle delete (with confirmation)
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item.value);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const newArray = detallesArray.filter((det) => det !== itemToDelete);
    const success = await updateDetallesArray(newArray);
    if (success) {
      setSnackbar({
        open: true,
        message: "Detalle eliminado correctamente",
        severity: "success",
      });
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return {
    detallesArray,
    loading,
    handleSubmit,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
