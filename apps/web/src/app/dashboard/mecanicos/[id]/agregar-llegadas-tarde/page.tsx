"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewLlegadaTardeForm from "@/sections/mecanicos/form/NewLlegadaTardeForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function AgregarLlegadasTardePage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agregar Llegada Tarde
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewLlegadaTardeForm empleadoId={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default AgregarLlegadasTardePage;
