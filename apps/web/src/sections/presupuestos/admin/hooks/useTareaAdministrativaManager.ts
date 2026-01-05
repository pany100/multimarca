import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useState } from "react";
import { usePresupuestoRequired } from "../contexts/PresupuestoContext";

interface TareaAdministrativa {
  id: number;
  descripcion: string;
  usuario: {
    id: number;
    fullName: string;
  };
}

export const useTareaAdministrativaManager = () => {
  const { authFetch } = useFetch();
  const { presupuesto, setPresupuesto } = usePresupuestoRequired();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tareaToDelete, setTareaToDelete] = useState<TareaAdministrativa | null>(
    null
  );

  // Add tarea
  const handleAddTarea = async (usuarioId: number, descripcion: string) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/tareas-administrativas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presupuestoId: presupuesto.id,
          usuarioId,
          descripcion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al agregar tarea");
      }

      // Refresh presupuesto data
      const presupuestoResponse = await authFetch(
        `/api/presupuestos/${presupuesto.id}`
      );
      const presupuestoActualizado = await presupuestoResponse.json();
      setPresupuesto(presupuestoActualizado);

      setSnackbar({
        open: true,
        message: "Tarea agregada correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al agregar tarea",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update tarea
  const handleUpdateTarea = async (
    tareaId: number,
    usuarioId: number,
    descripcion: string
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/tareas-administrativas/${tareaId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId, descripcion }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar tarea");
      }

      // Refresh presupuesto data
      const presupuestoResponse = await authFetch(
        `/api/presupuestos/${presupuesto.id}`
      );
      const presupuestoActualizado = await presupuestoResponse.json();
      setPresupuesto(presupuestoActualizado);

      setSnackbar({
        open: true,
        message: "Tarea actualizada correctamente",
        severity: "success",
      });
      return true;
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar tarea",
        severity: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete tarea
  const handleDeleteClick = (tarea: TareaAdministrativa) => {
    setTareaToDelete(tarea);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tareaToDelete) return;

    setLoading(true);
    try {
      const response = await authFetch(
        `/api/tareas-administrativas/${tareaToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar tarea");
      }

      // Refresh presupuesto data
      const presupuestoResponse = await authFetch(
        `/api/presupuestos/${presupuesto.id}`
      );
      const presupuestoActualizado = await presupuestoResponse.json();
      setPresupuesto(presupuestoActualizado);

      setSnackbar({
        open: true,
        message: "Tarea eliminada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar tarea",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setTareaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTareaToDelete(null);
  };

  return {
    loading,
    handleAddTarea,
    handleUpdateTarea,
    handleDeleteClick,
    deleteConfirmOpen,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
