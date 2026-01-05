import { Alert, Snackbar } from "@mui/material";

interface PresupuestoSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

export const PresupuestoSnackbar = ({
  open,
  message,
  severity,
  onClose,
}: PresupuestoSnackbarProps) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
