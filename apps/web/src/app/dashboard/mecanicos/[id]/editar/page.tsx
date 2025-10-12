"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import EditEmpleadoForm from "@/sections/mecanicos/form/EditEmpleadoForm";
import useEmpleadoFetcher from "@/sections/mecanicos/hooks/useEmpleadoFetcher";
import { AppBar, Toolbar, Typography } from "@mui/material";

function MecanicoEditarPage({ params }: { params: { id: string } }) {
  const { empleado } = useEmpleadoFetcher(params.id);
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
        {empleado && <EditEmpleadoForm empleado={empleado} />}
        <FormSnackbar />
      </SnackbarProvider>
    </>
  );
}

export default MecanicoEditarPage;
