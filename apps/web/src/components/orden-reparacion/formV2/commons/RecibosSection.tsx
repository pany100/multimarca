import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

const PreviewContainer = styled(Paper)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ImagePreview = styled("img")({
  width: "100%",
  height: "auto",
  maxHeight: "200px",
  objectFit: "contain",
  borderRadius: "4px",
});

function RecibosSection() {
  const { setValue, watch } = useFormContext();
  const recibos = watch("recibos") || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  // Create object URLs for existing recibos
  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};

    // For existing URLs, we'll just use them directly
    recibos.forEach((url: string) => {
      if (!previews[url]) {
        newPreviews[url] = url;
      }
    });

    if (Object.keys(newPreviews).length > 0) {
      setPreviews((prev) => ({ ...prev, ...newPreviews }));
    }

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(previews).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setError(null);
        setLoading(true);

        try {
          const uploadPromises = acceptedFiles.map(async (file) => {
            // Create FormData for each file
            const formData = new FormData();
            formData.append("file", file);

            // Upload the file to temporary storage
            const response = await fetch("/api/upload-tmp-file", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Error uploading file ${file.name}`);
            }

            const data = await response.json();

            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);

            return {
              url: data.url,
              objectUrl,
              fileName: file.name,
            };
          });

          // Wait for all uploads to complete
          const uploadedFiles = await Promise.all(uploadPromises);

          // Update previews
          const newPreviews: { [key: string]: string } = {};
          uploadedFiles.forEach(({ url, objectUrl }) => {
            newPreviews[url] = objectUrl;
          });

          setPreviews((prev) => ({ ...prev, ...newPreviews }));

          // Update form value with the S3 temporary URLs
          const newRecibos = uploadedFiles.map(({ url }) => url);

          setValue("recibos", [...recibos, ...newRecibos], {
            shouldValidate: true,
            shouldDirty: true,
          });
        } catch (err) {
          console.error("Error processing files:", err);
          setError(
            "Error al procesar los archivos. Por favor, intente nuevamente."
          );
        } finally {
          setLoading(false);
        }
      }
    },
    [recibos, setValue, previews]
  );

  const onDropRejected = useCallback(() => {
    setError(
      "Solo se permiten archivos de imagen (JPG o PNG). Por favor, intente nuevamente."
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    noClick: true,
    noKeyboard: false,
  });

  const handleRemoveRecibo = (index: number) => {
    const newRecibos = [...recibos];
    const removedUrl = newRecibos[index];

    // Revoke object URL if it's a blob
    if (previews[removedUrl] && previews[removedUrl].startsWith("blob:")) {
      URL.revokeObjectURL(previews[removedUrl]);
    }

    // Remove from previews
    const newPreviews = { ...previews };
    delete newPreviews[removedUrl];
    setPreviews(newPreviews);

    // Remove from form value
    newRecibos.splice(index, 1);
    setValue("recibos", newRecibos, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const getFileIcon = (url: string) => {
    if (url.endsWith(".pdf")) {
      return <PictureAsPdfIcon color="error" />;
    } else if (
      url.endsWith(".jpg") ||
      url.endsWith(".jpeg") ||
      url.endsWith(".png")
    ) {
      return <ImageIcon color="primary" />;
    } else {
      return <ReceiptIcon color="action" />;
    }
  };

  const getFileName = (url: string) => {
    // Extract filename from URL
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Display existing recibos */}
        {recibos.map((url: string, index: number) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <PreviewContainer>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                {getFileIcon(url)}
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getFileName(url)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                {previews[url] && (
                  <Tooltip title="Ver">
                    <IconButton
                      size="small"
                      onClick={() => window.open(previews[url], "_blank")}
                    >
                      <FileUploadIcon sx={{ transform: "rotate(180deg)" }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveRecibo(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </PreviewContainer>

            {/* Show preview for images */}
            {previews[url] &&
              (url.endsWith(".jpg") ||
                url.endsWith(".jpeg") ||
                url.endsWith(".png")) && (
                <ImagePreview src={previews[url]} alt={`Recibo ${index + 1}`} />
              )}
          </Grid>
        ))}
      </Grid>

      {/* Dropzone for new recibos */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 2,
          mt: 2,
          border: "2px dashed",
          borderRadius: 2,
          borderColor: isDragActive ? "primary.main" : "grey.300",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <FileUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {isDragActive
                ? "Suelte los archivos aquí"
                : "Arrastre y suelte los recibos aquí"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              o
            </Typography>
            <Button
              variant="outlined"
              onClick={open}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Seleccionar archivos
            </Button>
            <Typography
              variant="caption"
              display="block"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              Formatos aceptados: JPG, PNG
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default RecibosSection;
