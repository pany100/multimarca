import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { AusenciaProgramada } from "@prisma/client";

interface DeleteVacacionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vacacion: AusenciaProgramada | null;
  loading?: boolean;
}

function DeleteVacacionModal({
  open,
  onClose,
  onConfirm,
  vacacion,
  loading = false,
}: DeleteVacacionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro que desea eliminar esta vacación?</Typography>
        {vacacion && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vacación del{" "}
            {new Date(vacacion.fechaDesde).toLocaleDateString("es-AR")}
            al {new Date(vacacion.fechaHasta).toLocaleDateString("es-AR")}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteVacacionModal;
