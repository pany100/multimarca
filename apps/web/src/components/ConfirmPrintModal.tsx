"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export interface ConfirmPrintModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}

export default function ConfirmPrintModal({
  open,
  onClose,
  onConfirm,
  title = "Revisar antes de enviar",
  message = "¿Revisó que toda la información del informe final sea correcta antes de proceder con el envío?",
  cancelLabel = "Cancelar",
  confirmLabel = "Sí, imprimir",
}: ConfirmPrintModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-print-title"
      aria-describedby="confirm-print-description"
    >
      <DialogTitle id="confirm-print-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-print-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
