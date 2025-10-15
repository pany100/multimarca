import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Inasistencia } from "@prisma/client";

interface DeleteInasistenciaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inasistencia: Inasistencia | null;
  loading: boolean;
}

function DeleteInasistenciaModal({
  open,
  onClose,
  onConfirm,
  inasistencia,
  loading,
}: DeleteInasistenciaModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar la inasistencia del{" "}
          {inasistencia?.fecha
            ? new Date(inasistencia.fecha).toLocaleDateString("es-AR")
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

export default DeleteInasistenciaModal;
