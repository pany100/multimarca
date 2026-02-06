"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditCertificadoEstudioForm from "@/sections/mecanicos/form/EditCertificadoEstudioForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function EditarCertificadoEstudioPage({ params }: Props) {
  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editar Certificado de Estudio
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <EditCertificadoEstudioForm id={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default EditarCertificadoEstudioPage;
