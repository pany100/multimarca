import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { TypeOfOperation } from "@/core/application/services/agenda.service";
import { Recurrence } from "@prisma/client";
import { useAgendaUIContext } from "../contexts/AgendaUIContext";
import { useCalendarContext } from "../contexts/CalendarContext";
import { RecordatorioAgenda } from "./useRecordatorios";

function useRecordatoriosHandlers() {
  const { setSnackbar } = useSnackbarContext();
  const { setIsDeleteModalOpen, setLoading, setIsModalOpen, day } =
    useAgendaUIContext();
  const {
    currentRecordatorio,
    deleteRecordatorio,
    updateRecordatorio,
    createRecordatorio,
    forceRefreshRecordatorios,
  } = useCalendarContext();
  const handleDelete = async (typeOfDelete: TypeOfOperation) => {
    if (!currentRecordatorio || !day) {
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
      await deleteRecordatorio(currentRecordatorio?.id, typeOfDelete, day);
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
      await updateRecordatorio(
        {
          id: recordatorio.id,
          hecho: !recordatorio.hecho,
          titulo: recordatorio.titulo,
          descripcion: recordatorio.descripcion,
          fecha: recordatorio.fecha,
          recurrence: Recurrence.No,
          fechaFinRecurrencia: null,
        },
        "this"
      );
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Recordatorio actualizado correctamente",
        severity: "success",
      });
      forceRefreshRecordatorios();
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

  const handleUpdate = async (
    recordatorio: RecordatorioAgenda,
    typeOfUpdate: TypeOfOperation
  ) => {
    try {
      setLoading(true);
      await updateRecordatorio(recordatorio, typeOfUpdate);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Recordatorio actualizado correctamente",
        severity: "success",
      });
      forceRefreshRecordatorios();
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
