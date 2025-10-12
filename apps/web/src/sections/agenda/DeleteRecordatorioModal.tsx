import CustomRadioButton from "@/components/formV2/CustomRadioButton";
import { TypeOfOperation } from "@/core/application/services/agenda.service";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Recurrence } from "@prisma/client";
import { useState } from "react";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";
import useRecordatoriosHandlers from "./hooks/useRecordatoriosHandlers";

function DeleteRecordatorioModal() {
  const { isDeleteModalOpen, setIsDeleteModalOpen, loading } =
    useAgendaUIContext();
  const { typeOfOperation } = useFixedSelectData();

  const [typeOfDelete, setTypeOfDelete] = useState<TypeOfOperation>("this");
  const { currentRecordatorio } = useCalendarContext();

  const { handleDelete } = useRecordatoriosHandlers();

  return (
    <Dialog
      open={isDeleteModalOpen}
      onClose={() => {
        setIsDeleteModalOpen(false);
        setTypeOfDelete("this");
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Está seguro que desea eliminar este recordatorio?
        </Typography>
        {currentRecordatorio &&
          currentRecordatorio.recurrence !== Recurrence.No && (
            <CustomRadioButton
              options={typeOfOperation}
              value={typeOfDelete}
              onChange={(value) => setTypeOfDelete(value as TypeOfOperation)}
              label="Qué elemento recurrente desea eliminar?"
            />
          )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => {
            setIsDeleteModalOpen(false);
            setTypeOfDelete("this");
          }}
        >
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            handleDelete(typeOfDelete);
            setTypeOfDelete("this");
          }}
          disabled={loading}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteRecordatorioModal;
