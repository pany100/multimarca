import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Box, Button } from "@mui/material";

const NuevaVentaV2Button = () => {
  const { showModal } = useGlobalModal();

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddShoppingCartIcon />}
        onClick={showModal}
        sx={{
          backgroundColor: "#8A2BE2", // Violet color
          "&:hover": {
            backgroundColor: "#7B1FA2", // Darker violet on hover
          },
        }}
      >
        Agregar Ventas V2
      </Button>
    </Box>
  );
};

export default NuevaVentaV2Button;
