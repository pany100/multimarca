import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface CedulaVerdeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File | null) => void;
  patente: string;
}

const CedulaVerdeModal: React.FC<CedulaVerdeModalProps> = ({
  open,
  onClose,
  onSave,
  patente,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    multiple: false,
  });

  const handleSave = () => {
    onSave(file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Agregar o actualizar cédula verde para el vehículo con patente:{" "}
          {patente}
        </Typography>
        <Paper
          {...getRootProps()}
          sx={{
            p: 2,
            mt: 2,
            mb: 2,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragActive ? "action.hover" : "background.paper",
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <Typography>Archivo seleccionado: {file.name}</Typography>
          ) : (
            <Typography>
              {isDragActive
                ? "Suelta el archivo aquí"
                : "Arrastra y suelta una imagen aquí, o haz clic para seleccionar"}
            </Typography>
          )}
        </Paper>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Descartar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!file}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CedulaVerdeModal;
