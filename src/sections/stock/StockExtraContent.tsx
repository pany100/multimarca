import useExportStock from "@/hooks/useExportStock";
import { Box, Button } from "@mui/material";
import PreciosProveedorModal from "./PreciosProveedorModal";

function StockExtraContent({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { exportToPdf } = useExportStock();
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
          <Button variant="contained" color="secondary" onClick={exportToPdf}>
            Exportar lista de stock
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default StockExtraContent;
