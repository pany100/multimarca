import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { useAgendaUIContext } from "../contexts/AgendaUIContext";
import { useCalendarContext } from "../contexts/CalendarContext";
import { RecordatorioAgenda } from "./useRecordatorios";

function useRecordatoriosHandlers() {
  const { setSnackbar } = useSnackbarContext();
  const { setIsDeleteModalOpen, setLoading, setIsModalOpen } =
    useAgendaUIContext();
  const {
    currentRecordatorio,
    deleteRecordatorio,
    updateRecordatorio,
    createRecordatorio,
    forceRefreshRecordatorios,
  } = useCalendarContext();
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
      forceRefreshRecordatorios();
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

  const handleCreate = async (recordatorio: Omit<RecordatorioAgenda, "id">) => {
    try {
      setLoading(true);
      await createRecordatorio(recordatorio);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Recordatorio creado correctamente",
        severity: "success",
      });
      forceRefreshRecordatorios();
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Error al crear recordatorio",
        severity: "error",
      });
    }
    setIsModalOpen(false);
  };

  const handleUpdate = async (recordatorio: RecordatorioAgenda) => {
    try {
      setLoading(true);
      await updateRecordatorio(recordatorio);
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
    setIsModalOpen(false);
  };
  return { handleDelete, toggleHecho, handleCreate, handleUpdate };
}

export default useRecordatoriosHandlers;
