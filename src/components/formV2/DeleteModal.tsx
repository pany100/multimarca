import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  entity: any;
  setFeedback: (feedback: {
    type: "success" | "error";
    message: string;
  }) => void;
};

const DeleteModal = ({ open, onClose, entity, setFeedback }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!entity) return;

    setLoading(true);
    try {
      setFeedback({
        type: "success",
        message: "Elemento eliminado correctamente",
      });
      onClose();
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Error al eliminar el elemento",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          ¿Está seguro que desea eliminar este elemento? Esta acción no se puede
          deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
