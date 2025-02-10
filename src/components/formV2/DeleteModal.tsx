import { useFetch } from "@/contexts/FetchContext";
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
  apiEndpoint: string;
  open: boolean;
  onClose: () => void;
  entity: any;
  setFeedback: (feedback: {
    type: "success" | "error";
    message: string;
  }) => void;
  onSuccess: () => void;
};

const DeleteModal = ({
  open,
  onClose,
  entity,
  setFeedback,
  apiEndpoint,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const { authFetch } = useFetch();

  const handleDelete = async () => {
    if (!entity) return;

    setLoading(true);
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;
      const response = await authFetch(`${baseUrl}/${entity.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el elemento");
      }
      setFeedback({
        type: "success",
        message: "Elemento eliminado correctamente",
      });
      onSuccess();
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
      <DialogActions sx={{ mr: 2, mb: 2 }}>
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
