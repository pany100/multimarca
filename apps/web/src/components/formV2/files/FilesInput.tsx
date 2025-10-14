import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

type Props = {
  label: string;
  filePath: string | null;
  setFilePath: (file: string | null) => void;
  acceptedTypes?: "images" | "pdfs" | "both";
};

function FilesInput({
  filePath,
  label,
  setFilePath,
  acceptedTypes = "both",
}: Props) {
  const [loading, setLoading] = useState(false);

  const getAcceptAttribute = () => {
    switch (acceptedTypes) {
      case "images":
        return "image/*";
      case "pdfs":
        return ".pdf";
      case "both":
        return "image/*,.pdf";
      default:
        return "image/*,.pdf";
    }
  };

  const getFileType = (url: string | null): "image" | "pdf" | null => {
    if (!url) return null;
    const extension = url.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
      return "image";
    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-tmp-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const data = await response.json();
      setFilePath(data.url);
    } catch (error) {
      console.error("Error al subir archivo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = () => {
    setFilePath(null);
  };

  const renderFilePreview = () => {
    const fileType = getFileType(filePath);

    if (fileType === "image") {
      return (
        <Image
          src={filePath!}
          alt="Imagen seleccionada"
          width={300}
          height={200}
          style={{ width: "300px", height: "auto", borderRadius: "8px" }}
        />
      );
    }

    if (fileType === "pdf") {
      return (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Vista previa del PDF
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 300,
              border: "1px solid #ddd",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <iframe
              src={`${filePath!}#toolbar=0&navpanes=0&scrollbar=0`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Vista previa del PDF"
            />
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open(filePath!, "_blank")}
          >
            Abrir en nueva pestaña
          </Button>
        </Paper>
      );
    }

    return null;
  };

  const getButtonText = () => {
    switch (acceptedTypes) {
      case "images":
        return "Subir imagen";
      case "pdfs":
        return "Subir PDF";
      case "both":
        return "Subir archivo";
      default:
        return "Subir archivo";
    }
  };

  const getNoFileText = () => {
    switch (acceptedTypes) {
      case "images":
        return "No hay imagen seleccionada";
      case "pdfs":
        return "No hay PDF seleccionado";
      case "both":
        return "No hay archivo seleccionado";
      default:
        return "No hay archivo seleccionado";
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <FormLabel
        sx={{
          color: "rgba(0, 0, 0, 0.6)",
          fontSize: "1rem",
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
          fontWeight: 400,
          lineHeight: 1.4375,
          display: "block",
          mb: 1,
        }}
      >
        {label}
      </FormLabel>

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
      >
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}

        {!loading && filePath && (
          <>
            {renderFilePreview()}
            <Stack spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteFile}
                size="small"
              >
                Eliminar
              </Button>
              <Button variant="contained" component="label" size="small">
                Cambiar archivo
                <input
                  type="file"
                  accept={getAcceptAttribute()}
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
            </Stack>
          </>
        )}

        {!loading && !filePath && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography color="text.secondary">{getNoFileText()}</Typography>
            <Button variant="contained" component="label">
              {getButtonText()}
              <input
                type="file"
                accept={getAcceptAttribute()}
                onChange={handleFileChange}
                hidden
              />
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default FilesInput;
