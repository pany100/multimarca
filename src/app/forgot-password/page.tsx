"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const { fetch, isLoading } = useFetch();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          message:
            "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
          severity: "success",
        });
      } else {
        setMessage({
          message:
            data.error ||
            "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        message: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        severity: "error",
      });
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLoading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        />
      )}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Olvidé mi contraseña
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            Enviar instrucciones
          </Button>
          {message && (
            <Alert severity={message.severity}>{message.message}</Alert>
          )}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link href="/login" variant="body2">
              Volver al inicio de sesión
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
