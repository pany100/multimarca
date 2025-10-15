"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditLicenciaForm from "@/sections/mecanicos/form/EditLicenciaForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarLicenciaPage({ params }: Props) {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Licencia
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditLicenciaForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarLicenciaPage;
