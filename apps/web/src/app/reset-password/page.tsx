"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import * as yup from "yup";

const validationSchema = yup.object({
  newPassword: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetch, isLoading } = useFetch();

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
      token: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: values.token,
            newPassword: values.newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          formik.setStatus({
            message: "Contraseña restablecida con éxito.",
            severity: "success",
          });
          setTimeout(() => router.push("/login"), 1500);
        } else {
          formik.setStatus({
            message:
              data.error ||
              "Ha ocurrido un error al restablecer la contraseña.",
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

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      formik.setFieldValue("token", tokenFromUrl);
    } else {
      formik.setStatus({
        message: "Token no encontrado en la URL.",
        severity: "error",
      });
    }
  }, [searchParams]);

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
          Restablecer contraseña
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Ingresa y confirma tu nueva contraseña para restablecer tu cuenta.
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
            name="newPassword"
            label="Nueva contraseña"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.newPassword && Boolean(formik.errors.newPassword)
            }
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            aria-label="Nueva contraseña"
          />
          <TextField
            margin="normal"
            name="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
            aria-label="Confirmar nueva contraseña"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!formik.values.token || formik.isSubmitting || isLoading}
          >
            Restablecer contraseña
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
