"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditSueldoForm from "@/sections/mecanicos/form/EditSueldoForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarSueldoPage({ params }: Props) {
  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Sueldo
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditSueldoForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarSueldoPage;
