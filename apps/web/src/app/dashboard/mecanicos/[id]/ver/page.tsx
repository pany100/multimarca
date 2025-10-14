"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import MecanicosPage from "@/sections/mecanicos/MecanicosPage";
import { EmpleadosProvider } from "@/sections/mecanicos/context/EmpleadosContext";

const VerEmpleadoPage = ({ params }: { params: { id: string } }) => {
  return (
    <EmpleadosProvider id={params.id}>
      <SnackbarProvider>
        <MecanicosPage />
        <FormSnackbar />
      </SnackbarProvider>
    </EmpleadosProvider>
  );
};

export default VerEmpleadoPage;
