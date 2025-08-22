"use client";

import usePlantillaForm from "@/hooks/plantilla/usePlantillaForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import CustomInputText from "../formV2/CustomInputText";
import FormActions from "../orden-reparacion/formV2/commons/FormActions";
import FormSection from "../orden-reparacion/formV2/commons/FormSection";
import ReparacionTercerosSection from "../orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import TrabajosRealizadosSection from "../orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";
import schema from "./schema";

function NuevaPlantillaForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit } = methods;
  const { onSubmit } = usePlantillaForm();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ pb: 2 }}>
          <CustomInputText name="nombre" label="Nombre de la plantilla" />
        </Box>
        <FormSection title="Repuestos Usados">
          <RepuestosUsadosSection />
        </FormSection>
        <FormSection title="Reparación / Repuestos de terceros">
          <ReparacionTercerosSection />
        </FormSection>
        <FormSection title="Trabajos Realizados">
          <TrabajosRealizadosSection />
        </FormSection>
        <FormActions
          href="/dashboard/plantilla-presupuesto"
          label="Plantilla"
        />
      </form>
    </FormProvider>
  );
}

export default NuevaPlantillaForm;
