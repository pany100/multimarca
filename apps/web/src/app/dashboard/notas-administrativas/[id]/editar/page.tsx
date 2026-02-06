"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditNotaAdministrativaForm from "@/sections/mecanicos/form/EditNotaAdministrativaForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarNotaAdministrativaPage({ params }: Props) {
  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Nota Administrativa
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditNotaAdministrativaForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarNotaAdministrativaPage;
