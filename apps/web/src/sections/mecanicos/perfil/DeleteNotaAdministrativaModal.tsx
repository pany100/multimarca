import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { NotaAdministrativa } from "@prisma/client";
import { getFormattedDate } from "@/utils/fieldHelper";

interface DeleteNotaAdministrativaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nota: NotaAdministrativa | null;
  loading: boolean;
}

function DeleteNotaAdministrativaModal({
  open,
  onClose,
  onConfirm,
  nota,
  loading,
}: DeleteNotaAdministrativaModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar la nota
          {nota?.titulo ? ` "${nota.titulo}"` : ""}
          {nota?.fecha
            ? ` del ${getFormattedDate(nota.fecha as unknown as string)}`
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

export default DeleteNotaAdministrativaModal;
