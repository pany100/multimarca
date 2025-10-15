"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditHoraExtraForm from "@/sections/mecanicos/form/EditHoraExtraForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarHoraExtraPage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Hora Extra
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditHoraExtraForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarHoraExtraPage;
