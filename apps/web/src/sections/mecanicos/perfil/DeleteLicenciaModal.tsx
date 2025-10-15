import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { AusenciaProgramada } from "@prisma/client";

interface DeleteLicenciaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  licencia: AusenciaProgramada | null;
  loading?: boolean;
}

function DeleteLicenciaModal({
  open,
  onClose,
  onConfirm,
  licencia,
  loading = false,
}: DeleteLicenciaModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro que desea eliminar esta licencia?</Typography>
        {licencia && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Licencia del{" "}
            {new Date(licencia.fechaDesde).toLocaleDateString("es-AR")}
            al {new Date(licencia.fechaHasta).toLocaleDateString("es-AR")}
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

export default DeleteLicenciaModal;
