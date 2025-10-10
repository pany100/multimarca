import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useAgendaUIContext } from "../contexts/AgendaUIContext";
import { useCalendarContext } from "../contexts/CalendarContext";
import { RecordatorioAgenda } from "./useRecordatorios";

function useRecordatoriosHandlers() {
  const { setSnackbar } = useSnackbarContext();
  const { setIsDeleteModalOpen, setLoading } = useAgendaUIContext();
  const { currentRecordatorio, deleteRecordatorio, updateRecordatorio } =
    useCalendarContext();
  const handleDelete = async () => {
    if (!currentRecordatorio) {
      setSnackbar({
        open: true,
        message: "No se seleccionó ningún recordatorio",
        severity: "error",
      });
      setIsDeleteModalOpen(false);
      return;
    }
    try {
      setLoading(true);
      await deleteRecordatorio(currentRecordatorio?.id);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Recordatorio eliminado correctamente",
        severity: "success",
      });
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Error al eliminar recordatorio",
        severity: "error",
      });
    }
    setIsDeleteModalOpen(false);
  };

  const toggleHecho = async (recordatorio: RecordatorioAgenda) => {
    try {
      setLoading(true);
      await updateRecordatorio({
        ...recordatorio,
        hecho: !recordatorio.hecho,
      });
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Recordatorio actualizado correctamente",
        severity: "success",
      });
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Error al actualizar recordatorio",
        severity: "error",
      });
    }
  };
  return { handleDelete, toggleHecho };
}

export default useRecordatoriosHandlers;
