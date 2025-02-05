"use client";

import { useFetch } from "@/contexts/FetchContext";
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
import { useFormik } from "formik";
import Image from "next/image";
import * as yup from "yup";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es requerido"),
});

export default function ForgotPasswordPage() {
  const { fetch, isLoading } = useFetch();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (response.ok) {
          formik.setStatus({
            message:
              "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
            severity: "success",
          });
        } else {
          formik.setStatus({
            message:
              data.error ||
              "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        formik.setStatus({
          message: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
          severity: "error",
        });
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
          Olvidé mi contraseña
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña.
        </Typography>

        {formik.status && (
          <Alert
            severity={formik.status.severity}
            sx={{ mt: 2, mb: 2, width: "100%" }}
          >
            {formik.status.message}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting || isLoading}
          >
            Enviar instrucciones
          </Button>
          <Link
            href="/login"
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
            Volver al inicio de sesión
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
