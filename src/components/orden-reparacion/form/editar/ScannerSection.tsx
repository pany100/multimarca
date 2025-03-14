import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Paper, Typography } from "@mui/material";
import ScannerForm from "../../ScannerForm";

function ScannerSection({
  ordenReparacion,
  selectedFile,
  setSelectedFile,
}: {
  ordenReparacion: {
    pdfPath: string | null;
  };
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <PictureAsPdfIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Informe del Scanner
        </Typography>
      </Box>
      <ScannerForm
        ordenReparacion={ordenReparacion}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
    </Paper>
  );
}

export default ScannerSection;
