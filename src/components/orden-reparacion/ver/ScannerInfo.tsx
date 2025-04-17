import PrintIcon from "@mui/icons-material/Print";
import { Box, Typography, useTheme } from "@mui/material";
interface ScannerInfoProps {
  ordenReparacion: any;
}

const ScannerInfo: React.FC<ScannerInfoProps> = ({ ordenReparacion }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <PrintIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Salida del Scanner
      </Typography>
      {ordenReparacion.pdfPath ? (
        <Box sx={{ width: "100%", height: "500px" }}>
          <iframe
            src={ordenReparacion.pdfPath}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Documento Escaneado"
          />
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No hay documento escaneado adjuntado
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScannerInfo;
