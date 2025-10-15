"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewLicenciaForm from "@/sections/mecanicos/form/NewLicenciaForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function AgregarLicenciasPage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agregar Licencias
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewLicenciaForm empleadoId={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default AgregarLicenciasPage;
