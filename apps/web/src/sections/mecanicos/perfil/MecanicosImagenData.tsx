import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface MecanicosImagenDataProps {
  filePath: string | null;
  alt?: string;
  maxWidth?: number;
  maxHeight?: number;
}

function MecanicosImagenData({
  filePath,
  alt = "Imagen",
  maxWidth = 300,
  maxHeight = 300,
}: MecanicosImagenDataProps) {
  if (filePath) {
    return (
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          maxWidth,
          maxHeight,
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
        Sin foto
      </Typography>
    </Box>
  );
}

export default MecanicosImagenData;
