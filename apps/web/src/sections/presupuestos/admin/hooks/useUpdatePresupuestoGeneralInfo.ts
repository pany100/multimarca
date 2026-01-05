import { useState } from "react";
import { useUpdatePresupuesto } from "@/sections/presupuestos/hooks/useUpdatePresupuesto";

export const useUpdatePresupuestoGeneralInfo = () => {
  const updatePresupuestoGeneric = useUpdatePresupuesto;

  const updatePresupuestoGeneralInfo = async (
    presupuestoId: number,
    data: {
      autoId?: number | null;
      estado?: string;
      fechaEnvio?: string | null;
      fechaRespuesta?: string | null;
      informacionAuto?: string;
      informacionCliente?: string;
      observacionesCliente?: string;
    }
  ) => {
    const { updatePresupuesto } = updatePresupuestoGeneric(presupuestoId);
    return await updatePresupuesto(data);
  };

  return {
    updatePresupuestoGeneralInfo,
    loading: false, // El loading se maneja en el hook genérico
  };
};
