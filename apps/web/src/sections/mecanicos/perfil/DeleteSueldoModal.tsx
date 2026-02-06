import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Sueldo } from "@prisma/client";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";

interface DeleteSueldoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sueldo: Sueldo | null;
  loading: boolean;
}

function DeleteSueldoModal({
  open,
  onClose,
  onConfirm,
  sueldo,
  loading,
}: DeleteSueldoModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar el sueldo del{" "}
          {sueldo?.fecha
            ? getFormattedDate(sueldo.fecha as unknown as string)
            : ""}{" "}
          ({sueldo?.monto != null ? getFormattedPrice(Number(sueldo.monto)) : ""}
          )?
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

export default DeleteSueldoModal;
