import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  ordenReparacion: {
    pdfPath: string | null;
  };
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
};

function ScannerForm({
  ordenReparacion,
  selectedFile,
  setSelectedFile,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setError(null);
        setLoading(true);

        // Simulate loading for demo purposes
        setTimeout(() => {
          setSelectedFile(acceptedFiles[0]);
          setLoading(false);
        }, 800);
      }
    },
    [setSelectedFile]
  );

  const onDropRejected = useCallback(() => {
    setError("Solo se permiten archivos PDF. Por favor, intente nuevamente.");
  }, []);

  const fileUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    noClick: true, // Disable click to open file dialog
    noKeyboard: false, // Allow keyboard navigation
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <Box sx={{ position: "relative" }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 0,
          border: "2px dashed",
          borderRadius: 2,
          borderColor: isDragActive
            ? "primary.main"
            : selectedFile || ordenReparacion.pdfPath
            ? "divider"
            : "grey.300",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor:
              !selectedFile && !ordenReparacion.pdfPath
                ? "primary.light"
                : undefined,
          },
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Cargando archivo...
            </Typography>
          </Box>
        ) : selectedFile ? (
          <Box>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PictureAsPdfIcon
                  color="primary"
                  sx={{ mr: 1.5, fontSize: "1.5rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB • PDF
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Eliminar archivo">
                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  color="error"
                  aria-label="Eliminar archivo"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              component="iframe"
              src={fileUrl || ""}
              width="100%"
              height="400px"
              sx={{
                border: "none",
                display: "block",
              }}
              title="Vista previa del PDF"
            />
          </Box>
        ) : ordenReparacion.pdfPath ? (
          <Box>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PictureAsPdfIcon
                  color="primary"
                  sx={{ mr: 1.5, fontSize: "1.5rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    {ordenReparacion.pdfPath.split("/").pop()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF existente
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={open}
                startIcon={<FileUploadIcon />}
                sx={{ borderRadius: 1.5 }}
              >
                Reemplazar
              </Button>
            </Box>
            <Box
              component="iframe"
              src={ordenReparacion.pdfPath}
              width="100%"
              height="400px"
              sx={{
                border: "none",
                display: "block",
              }}
              title="Vista previa del PDF existente"
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              textAlign: "center",
            }}
          >
            <PictureAsPdfIcon
              sx={{
                fontSize: 56,
                color: isDragActive ? "primary.main" : "text.secondary",
                mb: 2,
                opacity: 0.8,
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: isDragActive ? "primary.main" : "text.primary",
              }}
            >
              {isDragActive
                ? "Suelta el archivo PDF aquí..."
                : "Sube un informe de scanner en formato PDF"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 400 }}
            >
              {isDragActive
                ? "El archivo se cargará automáticamente"
                : "Arrastra y suelta un archivo PDF aquí, o usa el botón para seleccionar uno desde tu dispositivo"}
            </Typography>
            <Button
              variant="contained"
              onClick={open}
              startIcon={<FileUploadIcon />}
              sx={{ mt: 3, borderRadius: 1.5 }}
            >
              Seleccionar archivo
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ScannerForm;
