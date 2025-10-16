import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface CrearTareaDialogProps {
  open: boolean;
  onClose: () => void;
  onCrear: (descripcion: string) => Promise<void>;
}

const CrearTareaDialog = ({ open, onClose, onCrear }: CrearTareaDialogProps) => {
  const [descripcion, setDescripcion] = useState("");

  const handleCrear = async () => {
    if (descripcion.trim()) {
      await onCrear(descripcion);
      setDescripcion("");
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
      <DialogTitle>Nueva Tarea</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Descripción"
          type="text"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleCrear} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearTareaDialog;
