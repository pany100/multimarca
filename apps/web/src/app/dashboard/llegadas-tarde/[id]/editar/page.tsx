"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditLlegadaTardeForm from "@/sections/mecanicos/form/EditLlegadaTardeForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarLlegadaTardePage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Llegada Tarde
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditLlegadaTardeForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarLlegadaTardePage;
