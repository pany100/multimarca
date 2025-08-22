import { useAuth } from "@/hooks/useAuth";
import useExportarManoDeObra from "@/hooks/useExportarManoDeObra";
import { Box, Button, CircularProgress } from "@mui/material";
import PreciosModal from "./PreciosModal";

function ManoDeObraExtraContent({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { userData } = useAuth();
  const permisos = userData?.permisos || [];
  const { exportToPdf, isLoading } = useExportarManoDeObra();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {permisos.includes("EditarManoObra") && (
        <>
          <PreciosModal setRefreshTrigger={setRefreshTrigger} />
          <Box sx={{ width: "20px" }} />
        </>
      )}
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
            {isLoading ? "Generando PDF..." : "Exportar lista de mano de obra"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ManoDeObraExtraContent;
