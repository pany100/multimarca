import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { HoraExtra } from "@prisma/client";

interface DeleteHoraExtraModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  horaExtra: HoraExtra | null;
  loading: boolean;
}

function DeleteHoraExtraModal({
  open,
  onClose,
  onConfirm,
  horaExtra,
  loading,
}: DeleteHoraExtraModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar la hora extra del{" "}
          {horaExtra?.fecha
            ? new Date(horaExtra.fecha).toLocaleDateString("es-AR")
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

export default DeleteHoraExtraModal;
