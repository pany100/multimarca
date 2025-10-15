"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewHoraExtraForm from "@/sections/mecanicos/form/NewHoraExtraForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function AgregarHorasExtrasPage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agregar Hora Extra
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewHoraExtraForm empleadoId={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default AgregarHorasExtrasPage;
