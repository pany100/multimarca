import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { useOrden } from "../contexts/OrdenContext";
import { useUpdateObservacionesSalida } from "./useUpdateObservacionesSalida";

export const useObservacionesSalidaManager = () => {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateObservacionesSalida, loading } = useUpdateObservacionesSalida();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Parse observaciones from JSON string
  const observacionesArray: string[] = orden?.observacionesSalida
    ? JSON.parse(orden.observacionesSalida)
    : [];

  // Helper to update observaciones via PATCH
  const updateObservaciones = async (newArray: string[]) => {
    try {
      const ordenActualizada = await updateObservacionesSalida(
        orden.id,
        JSON.stringify(newArray)
      );
      setOrden(ordenActualizada);
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar las observaciones",
        severity: "error",
      });
      return false;
    }
  };

  // Handle add/edit submit
  const handleSubmit = async (observacion: string, editValue?: string) => {
    let newArray: string[];

    if (editValue) {
      // Edit: Replace the old value with the new one
      newArray = observacionesArray.map((obs) =>
        obs === editValue ? observacion : obs
      );
    } else {
      // Add: Append to the array
      newArray = [...observacionesArray, observacion];
    }

    const success = await updateObservaciones(newArray);
    if (success) {
      setSnackbar({
        open: true,
        message: editValue
          ? "Observación actualizada correctamente"
          : "Observación agregada correctamente",
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

    const newArray = observacionesArray.filter((obs) => obs !== itemToDelete);
    const success = await updateObservaciones(newArray);
    if (success) {
      setSnackbar({
        open: true,
        message: "Observación eliminada correctamente",
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
    observacionesArray,
    loading,
    handleSubmit,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
