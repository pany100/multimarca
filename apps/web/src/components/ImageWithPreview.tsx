"use client";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { Box } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export interface ImageWithPreviewProps {
  /** URL de la imagen */
  src: string;
  /** Texto alternativo */
  alt?: string;
  /** Título del modal al ampliar (opcional) */
  title?: string;
  /** Ancho del thumbnail en píxeles */
  width?: number;
  /** Alto del thumbnail en píxeles */
  height?: number;
  /** Si true, muestra un ícono de lupa sobre la imagen al hacer hover */
  showZoomIcon?: boolean;
}

/**
 * Muestra una miniatura de imagen que al hacer clic abre un modal con la imagen ampliada.
 * Reutilizable en tablas, listas o cualquier lugar donde se necesite previsualizar imágenes.
 */
const ImageWithPreview: React.FC<ImageWithPreviewProps> = ({
  src,
  alt = "Imagen",
  title,
  width = 100,
  height = 50,
  showZoomIcon = true,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Box
        onClick={() => setModalOpen(true)}
        sx={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
          "&:hover .zoom-overlay": {
            opacity: 1,
          },
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            objectFit: "cover",
            borderRadius: 4,
            display: "block",
          }}
          unoptimized={src.startsWith("/") || src.startsWith("http")}
        />
        {showZoomIcon && (
          <Box
            className="zoom-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.4)",
              borderRadius: 4,
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <ZoomInIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
        )}
      </Box>
      <ImagePreviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={src}
        alt={alt}
        title={title}
      />
    </>
  );
};

export default ImageWithPreview;
