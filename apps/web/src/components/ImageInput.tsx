import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

type Props = {
  label: string;
  image: string | null;
  setImage: (image: string | null) => void;
};

const ACCEPT = "image/*,application/pdf";

const isAllowedFile = (file: File) => {
  if (file.type === "application/pdf") return true;
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "webp", "gif", "bmp", "pdf"].includes(ext);
};

const isPdfPath = (path: string) => {
  const clean = path.split("?")[0].split("#")[0];
  return clean.toLowerCase().endsWith(".pdf");
};

function ImageInput({ image, label, setImage }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      setError("Solo se permiten imágenes o archivos PDF");
      event.target.value = "";
      return;
    }

    setError(null);
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
      setImage(data.url);
    } catch (err) {
      console.error("Error al subir archivo:", err);
      setError("Error al subir el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
  };

  const showPdf = image ? isPdfPath(image) : false;

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

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && image && (
        <Box>
          <Box display="flex" justifyContent="center" mb={2}>
            {showPdf ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 300,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src={image}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="Vista previa del PDF"
                />
              </Box>
            ) : (
              <Image
                src={image}
                alt="Imagen seleccionada"
                width={300}
                height={200}
                style={{ width: "300px", height: "auto" }}
              />
            )}
          </Box>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {showPdf && (
              <Button
                variant="outlined"
                onClick={() => window.open(image, "_blank")}
              >
                Abrir en nueva pestaña
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteImage}
            >
              Eliminar
            </Button>
            <Button variant="contained" component="label">
              Cambiar archivo
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleImageChange}
                hidden
              />
            </Button>
          </Stack>
        </Box>
      )}

      {!loading && !image && (
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
          <Typography mb={2}>No hay archivo seleccionado</Typography>
          <Button variant="contained" component="label">
            Subir imagen o PDF
            <input
              type="file"
              accept={ACCEPT}
              onChange={handleImageChange}
              hidden
            />
          </Button>
        </Box>
      )}

      {error && (
        <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default ImageInput;
