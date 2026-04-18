"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface ObservacionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (observacion: string) => void;
  initialValue?: string;
  loading?: boolean;
}

const ObservacionModal = ({
  open,
  onClose,
  onSubmit,
  initialValue = "",
  loading = false,
}: ObservacionModalProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>("");

  const isEdit = !!initialValue;

  // Update value when initialValue changes (for edit mode)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError("La observación no puede estar vacía");
      return;
    }

    setError("");
    onSubmit(trimmedValue);
    setValue("");
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Editar Trabajo Realizado" : "Agregar Trabajo Realizado"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Trabajo Realizado"
          fullWidth
          multiline
          rows={4}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          spellCheck
          placeholder="Describa los trabajos realizados"
          helperText={
            error ||
            "Incluya detalles como el tiempo de trabajo, el material utilizado, etc."
          }
          error={!!error}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 4 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {isEdit ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObservacionModal;
