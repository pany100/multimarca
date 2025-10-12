"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import NewMecanicoForm from "@/sections/mecanicos/form/NewMecanicoForm";
import { AppBar, Toolbar, Typography } from "@mui/material";

function MecanicoNuevoPage() {
  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Información del Empleado
          </Typography>
        </Toolbar>
      </AppBar>
      <SnackbarProvider>
        <NewMecanicoForm />
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default MecanicoNuevoPage;
