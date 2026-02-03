import { boschColors } from "@/theme";
import { Box, Button } from "@mui/material";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function BoschTemplateButton() {
  const boschTemplateRef = useRef(null);
  const handleBoschTemplatePrint = useReactToPrint({
    content: () => boschTemplateRef.current,
  });

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Button
        variant="contained"
        onClick={handleBoschTemplatePrint}
        sx={{
          backgroundColor: boschColors.boschBlue[75],
          "&:hover": { backgroundColor: boschColors.boschBlue[50] },
          marginLeft: "auto", // Esto empujará el botón hacia la derecha
        }}
      >
        Imprimir Plantilla Bosch
      </Button>
    </Box>
  );
}

export default BoschTemplateButton;
