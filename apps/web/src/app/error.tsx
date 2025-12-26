"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error capturado por boundary:", error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h4" component="h1">
          Algo salió mal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error?.message || "Ha ocurrido un error inesperado"}
        </Typography>
        {error?.digest && (
          <Typography variant="caption" color="text.secondary">
            Error ID: {error.digest}
          </Typography>
        )}
        <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
          Intentar nuevamente
        </Button>
      </Box>
    </Container>
  );
}
