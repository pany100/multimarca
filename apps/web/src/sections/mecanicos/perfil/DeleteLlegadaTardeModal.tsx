import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { LlegadaTarde } from "@prisma/client";

interface DeleteLlegadaTardeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  llegadaTarde: LlegadaTarde | null;
  loading: boolean;
}

function DeleteLlegadaTardeModal({
  open,
  onClose,
  onConfirm,
  llegadaTarde,
  loading,
}: DeleteLlegadaTardeModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar la llegada tarde del{" "}
          {llegadaTarde?.fecha
            ? new Date(llegadaTarde.fecha).toLocaleDateString("es-AR")
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

export default DeleteLlegadaTardeModal;
