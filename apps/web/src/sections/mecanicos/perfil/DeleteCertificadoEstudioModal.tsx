import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { CertificadoEstudio } from "@prisma/client";

interface DeleteCertificadoEstudioModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certificado: CertificadoEstudio | null;
  loading: boolean;
}

function DeleteCertificadoEstudioModal({
  open,
  onClose,
  onConfirm,
  certificado,
  loading,
}: DeleteCertificadoEstudioModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar el certificado
          {certificado?.nombre ? ` "${certificado.nombre}"` : ""}?
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

export default DeleteCertificadoEstudioModal;
