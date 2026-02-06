"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewSueldoForm from "@/sections/mecanicos/form/NewSueldoForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function AgregarSueldosPage({ params }: Props) {
  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agregar Sueldo
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewSueldoForm empleadoId={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default AgregarSueldosPage;
