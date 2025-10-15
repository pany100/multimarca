import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Apercibimiento } from "@prisma/client";

interface DeleteApercibimientoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  apercibimiento: Apercibimiento | null;
  loading: boolean;
}

function DeleteApercibimientoModal({
  open,
  onClose,
  onConfirm,
  apercibimiento,
  loading,
}: DeleteApercibimientoModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar el apercibimiento del{" "}
          {apercibimiento?.fecha
            ? new Date(apercibimiento.fecha).toLocaleDateString("es-AR")
            : ""}
          ?
        </DialogContentText>
        <DialogContentText sx={{ mt: 1, fontWeight: "bold" }}>
          Esta acción no se puede deshacer.
        </DialogContentText>
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
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteApercibimientoModal;
