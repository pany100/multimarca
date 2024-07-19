"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        setMessage(
          "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña."
        );
      } else {
        setMessage(
          data.error || "Ha ocurrido un error. Por favor, inténtalo de nuevo."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
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
          >
            Enviar instrucciones
          </Button>
          {message && (
            <Typography color="primary" align="center" sx={{ mt: 2 }}>
              {message}
            </Typography>
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
