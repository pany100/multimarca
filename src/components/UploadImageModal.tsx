import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadImageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File | null) => void;
  title: string;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  open,
  onClose,
  onSave,
  title,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

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
          {title}
        </Typography>
        {file ? (
          <Typography>Archivo seleccionado: {file.name}</Typography>
        ) : (
          <>
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
              <Typography>
                {isDragActive
                  ? "Suelta el archivo aquí"
                  : "Arrastra y suelta una imagen aquí, o haz clic para seleccionar"}
              </Typography>
            </Paper>
            <Box sx={{ mt: 2, mb: 2, textAlign: "center" }}>
              <Typography>O</Typography>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Usar cámara
              </Button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </Box>
          </>
        )}
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

export default UploadImageModal;
