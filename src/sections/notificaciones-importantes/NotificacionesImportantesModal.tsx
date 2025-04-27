import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { NotificacionInterna } from "@prisma/client";
import { useEffect, useState } from "react";
import useNotificaciones from "./hooks/useNotificaciones";

interface NotificacionesImportantesModalProps {
  notificaciones: NotificacionInterna[];
  onMarcarComoLeida: (id: number) => Promise<void>;
}

export default function NotificacionesImportantesModal({
  notificaciones,
}: NotificacionesImportantesModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { marcarComoLeida } = useNotificaciones();
  const [open, setOpen] = useState(false);

  // Mostrar el modal cuando hay notificaciones
  useEffect(() => {
    if (notificaciones.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
      setCurrentIndex(0);
    }
  }, [notificaciones]);

  const handleClose = async () => {
    // Marcar la notificación actual como leída
    if (notificaciones[currentIndex]) {
      await marcarComoLeida(notificaciones[currentIndex].id);
    }

    // Si hay más notificaciones, mostrar la siguiente
    if (currentIndex < notificaciones.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Si no hay más, cerrar el modal
      setOpen(false);
      setCurrentIndex(0);
    }
  };

  if (!open || notificaciones.length === 0) return null;

  const currentNotificacion = notificaciones[currentIndex];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="notificacion-importante-title"
    >
      <DialogTitle id="notificacion-importante-title">
        {currentNotificacion.titulo}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" whiteSpace="pre-line">
            {currentNotificacion.texto}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {currentIndex + 1} de {notificaciones.length}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          {currentIndex < notificaciones.length - 1 ? "Siguiente" : "Cerrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
