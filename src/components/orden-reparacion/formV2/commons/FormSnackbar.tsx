import { useNuevaOrdenContext } from "@/contexts/NuevaOrdenContext";
import { Alert, Snackbar } from "@mui/material";

function FormSnackbar() {
  const { snackbar, setSnackbar } = useNuevaOrdenContext();
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        severity={snackbar.severity as "success" | "error"}
        variant="filled"
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default FormSnackbar;
