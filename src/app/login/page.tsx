"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { setCookie } from "cookies-next";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import * as yup from "yup";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es requerido"),
  password: yup.string().required("La contraseña es requerida"),
});

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isLoading, fetch } = useFetch();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const data = await response.json();
          setCookie("auth_token", data.token, {
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          router.push("/dashboard");
        } else {
          formik.setStatus(
            "Error de inicio de sesión. Por favor, verifica tus credenciales."
          );
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        formik.setStatus("Error al realizar la solicitud");
      }
    },
  });

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
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            mb: 4,
            width: "200px",
            height: "60px",
            position: "relative",
          }}
        >
          <Image
            src="/bosch-icon.svg"
            alt="Bosch Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </Box>

        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Iniciar sesión
        </Typography>

        {formik.status && (
          <Alert severity="error" sx={{ mt: 2, mb: 2, width: "100%" }}>
            {formik.status}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            width: "100%",
            "& .MuiTextField-root": { width: "100%" },
          }}
        >
          <TextField
            margin="normal"
            id="email"
            name="email"
            label="Correo electrónico"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            aria-label="Correo electrónico"
          />
          <TextField
            margin="normal"
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            aria-label="Contraseña"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting || isLoading}
          >
            Ingresar
          </Button>
          <Link
            href="/forgot-password"
            variant="body2"
            sx={{
              display: "block",
              textAlign: "center",
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
