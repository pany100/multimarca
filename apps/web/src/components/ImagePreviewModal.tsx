"use client";

import { Box, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import React from "react";

export interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  title?: string;
}

/**
 * Modal genérico para ver una imagen ampliada.
 * Se puede usar de forma controlada (open/onClose desde el padre) o
 * junto con ImageWithPreview que maneja el estado internamente.
 */
const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  onClose,
  src,
  alt = "Imagen",
  title,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 1,
          overflow: "hidden",
          outline: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Cerrar"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            maxHeight: "80vh",
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "78vh",
              objectFit: "contain",
            }}
            unoptimized={src.startsWith("/") || src.startsWith("http")}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default ImagePreviewModal;
