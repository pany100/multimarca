"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { EmpleadosProvider } from "@/sections/mecanicos/context/EmpleadosContext";
import ActualizarDocumentacionForm from "@/sections/mecanicos/perfil/ActualizarDocumentacionForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function ActualizarDocumentacionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Actualizar Documentación
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EmpleadosProvider id={params.id}>
          <ActualizarDocumentacionForm />
          <FormSnackbar />
        </EmpleadosProvider>
      </SnackbarProvider>
    </>
  );
}
