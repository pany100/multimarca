import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";

function NuevoPresupuestoButton() {
  const { showModal } = useGlobalModal();

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Button
        variant="contained"
        onClick={showModal}
        startIcon={<AddIcon />}
        sx={{
          backgroundColor: "purple",
          "&:hover": { backgroundColor: "purple" },
        }}
      >
        Nuevo Presupuesto V2
      </Button>
    </Box>
  );
}

export default NuevoPresupuestoButton;
