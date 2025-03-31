import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Link } from "@mui/material";

function FormActions() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 3,
        mb: 2,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        component={Link}
        href="/dashboard/ordenes-reparacion"
      >
        Volver a la lista
      </Button>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<SaveIcon />}
        sx={{
          px: 4,
          py: 1,
        }}
      >
        Crear Orden de Reparación
      </Button>
    </Box>
  );
}

export default FormActions;
