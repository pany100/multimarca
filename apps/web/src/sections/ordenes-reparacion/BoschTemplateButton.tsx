import BoschTemplate from "@/components/orden-reparacion/pdf/BoschTemplate";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { boschColors } from "@/theme";
import { Box, Button } from "@mui/material";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function BoschTemplateButton() {
  const { showModal } = useGlobalModal();
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
      <Button
        variant="contained"
        onClick={showModal}
        sx={{
          backgroundColor: "purple",
          "&:hover": { backgroundColor: boschColors.boschBlue[50] },
          marginLeft: "20px",
        }}
      >
        Nueva Orden V2
      </Button>
      <div style={{ display: "none" }}>
        <BoschTemplate ref={boschTemplateRef} />
      </div>
    </Box>
  );
}

export default BoschTemplateButton;
