import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import Image from "next/image";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileSelection(acceptedFiles[0]);
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setCapturedImageUrl(imageUrl);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    multiple: false,
  });

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsVideoReady(true);
            })
            .catch((error) => {
              console.error("Error al iniciar el video:", error);
            });
        };
      } else {
        console.error("Referencia de video no disponible");
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setFile(file);
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImageUrl(imageUrl);
        }
      }, "image/jpeg");
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelection(event.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave(file);
    handleClose();
  };

  const resetModal = () => {
    setFile(null);
    setCapturedImageUrl(null);
    setStream(null);
    setIsVideoReady(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };
  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography>Archivo seleccionado: {file.name}</Typography>
            {capturedImageUrl && (
              <Image
                src={capturedImageUrl}
                alt="Captured"
                width={400}
                height={300}
                style={{ width: "100%", height: "auto", marginTop: "10px" }}
              />
            )}
          </Box>
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
              {!file && !stream && (
                <Button onClick={startCamera} variant="outlined" sx={{ mt: 1 }}>
                  Usar cámara web
                </Button>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: isVideoReady ? "block" : "none",
                }}
              />
              {stream && !isVideoReady && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress />
                </Box>
              )}
              {stream && (
                <Button
                  onClick={capturePhoto}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Capturar foto
                </Button>
              )}
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
          <Button onClick={handleClose} sx={{ mr: 1 }}>
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
