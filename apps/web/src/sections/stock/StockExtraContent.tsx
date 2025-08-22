import useExportStock from "@/hooks/useExportStock";
import { Box, Button, CircularProgress } from "@mui/material";
import PreciosProveedorModal from "./PreciosProveedorModal";

function StockExtraContent({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { exportToPdf, isLoading } = useExportStock();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <PreciosProveedorModal setRefreshTrigger={setRefreshTrigger} />
      <Box sx={{ width: "20px" }} />
      <Box>
        <Box sx={{ width: "100%", mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToPdf}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? "Generando PDF..." : "Exportar lista de stock"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default StockExtraContent;
