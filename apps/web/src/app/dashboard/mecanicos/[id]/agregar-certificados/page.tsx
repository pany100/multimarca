"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewCertificadoEstudioForm from "@/sections/mecanicos/form/NewCertificadoEstudioForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface Props {
  params: { id: string };
}

function AgregarCertificadosPage({ params }: Props) {
  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agregar Certificado de Estudio
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewCertificadoEstudioForm empleadoId={params.id} />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default AgregarCertificadosPage;
