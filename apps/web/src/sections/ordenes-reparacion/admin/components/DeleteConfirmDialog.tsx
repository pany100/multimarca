"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  message = "¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.",
  loading = false,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          autoFocus
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
