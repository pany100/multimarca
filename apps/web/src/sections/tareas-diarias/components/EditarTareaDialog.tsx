import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TareaDiaria } from "../types/TareaDiaria";

interface EditarTareaDialogProps {
  open: boolean;
  onClose: () => void;
  tarea: TareaDiaria | null;
  onEditar: (id: number, data: { descripcion: string }) => Promise<void>;
}

const EditarTareaDialog = ({
  open,
  onClose,
  tarea,
  onEditar,
}: EditarTareaDialogProps) => {
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (tarea) {
      setDescripcion(tarea.descripcion);
    }
  }, [tarea]);

  const handleEditar = async () => {
    if (tarea && descripcion.trim()) {
      await onEditar(tarea.id, { descripcion });
      onClose();
    }
  };

  const handleClose = () => {
    setDescripcion("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          minWidth: "500px",
          maxWidth: "800px",
        },
      }}
    >
      <DialogTitle>Editar Tarea</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Descripción"
          type="text"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          spellCheck
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleEditar} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarTareaDialog;
