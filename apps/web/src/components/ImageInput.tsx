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

function ImageInput({ image, label, setImage }: Props) {
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (
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
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      setImage(data.url);
    } catch (error) {
      console.error("Error al subir imagen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
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
      >
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}
        {!loading && image && (
          <>
            <Image
              src={image}
              alt="Imagen seleccionada"
              width={300}
              height={200}
              style={{ width: "300px", height: "auto" }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteImage}
              >
                Eliminar
              </Button>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </Button>
              </Box>
            </Box>
          </>
        )}
        {!loading && !image && (
          <>
            <Typography>No hay imagen seleccionada</Typography>
            <Button variant="contained" component="label" sx={{ mt: 1 }}>
              Subir imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default ImageInput;
