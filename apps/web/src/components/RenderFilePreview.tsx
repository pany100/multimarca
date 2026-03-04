"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import Image from "next/image";

export interface RenderFilePreviewProps {
  filePath: string | null;
  alt?: string;
  maxWidth?: number;
  maxHeight?: number;
  emptyLabel?: string;
}

function getFileType(url: string | null): "image" | "pdf" | null {
  if (!url) return null;
  const extension = url.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
    return "image";
  return null;
}

function RenderFilePreview({
  filePath,
  alt = "Archivo",
  maxWidth = 300,
  maxHeight = 300,
  emptyLabel = "Sin archivo",
}: RenderFilePreviewProps) {
  if (!filePath) {
    return (
      <Box
        sx={{
          width: 80,
          height: 50,
          bgcolor: "action.hover",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {emptyLabel}
        </Typography>
      </Box>
    );
  }

  const fileType = getFileType(filePath);

  if (fileType === "image") {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          width: "100%",
          height: "100%",
          maxWidth,
          maxHeight,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            flex: 1,
            minHeight: Math.min(maxHeight - 50, 200),
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
          }}
        >
          <Image
            src={filePath}
            alt={alt}
            width={maxWidth}
            height={maxHeight}
            style={{
              objectFit: "contain",
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
            }}
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.open(filePath, "_blank")}
          sx={{ fontSize: "0.7rem", py: 0.3, px: 1 }}
        >
          Abrir imagen
        </Button>
      </Paper>
    );
  }

  if (fileType === "pdf") {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          width: "100%",
          height: "100%",
          maxWidth,
          maxHeight,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            flex: 1,
            minHeight: Math.min(maxHeight - 50, 200),
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <iframe
            src={`${filePath}#toolbar=0&navpanes=0&scrollbar=0`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Vista previa del PDF"
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.open(filePath, "_blank")}
          sx={{ fontSize: "0.7rem", py: 0.3, px: 1 }}
        >
          Abrir PDF
        </Button>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: 80,
        height: 50,
        bgcolor: "action.hover",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    </Box>
  );
}

export default RenderFilePreview;
