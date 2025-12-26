"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error en dashboard:", error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h4" component="h1">
          Error en el Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error?.message || "Ha ocurrido un error al cargar esta página"}
        </Typography>
        {error?.digest && (
          <Typography variant="caption" color="text.secondary">
            Error ID: {error.digest}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push("/dashboard")}>
            Volver al inicio
          </Button>
          <Button variant="contained" onClick={reset}>
            Intentar nuevamente
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
