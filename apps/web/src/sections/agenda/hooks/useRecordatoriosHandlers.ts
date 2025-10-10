import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useAgendaUIContext } from "../contexts/AgendaUIContext";
import { useCalendarContext } from "../contexts/CalendarContext";

function useRecordatoriosHandlers() {
  const { setSnackbar } = useSnackbarContext();
  const { setIsDeleteModalOpen, setLoading } = useAgendaUIContext();
  const { currentRecordatorio, deleteRecordatorio } = useCalendarContext();
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
  return { handleDelete };
}

export default useRecordatoriosHandlers;
