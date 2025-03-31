import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { NuevaOrdenProvider } from "@/contexts/NuevaOrdenContext";
import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import schema from "@/sections/ordenes-reparacion/nueva/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import FormSection from "../commons/FormSection";
import AutoSection from "../sections/autos/AutoSection";
import ClientObservationSection from "../sections/client-observations/ClientObservationSection";
import InputObservationSection from "../sections/input-observations/InputObservationsSection";
import MechanicsSection from "../sections/mechanics/MechanicsSection";
import ReparacionTercerosSection from "../sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "../sections/resumen-costos/ResumenCostosSection";
import TrabajosRealizadosSection from "../sections/trabajos-realizados/TrabajosRealizadosSection";
import FormActions from "../commons/FormActions";

function NuevaOrdenForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit, control, watch } = methods;
  const { onSubmit } = useNuevaOrden({ control });

  return (
    <NuevaOrdenProvider>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormSection title="Información del Vehículo y Fechas">
            <AutoSection />
          </FormSection>
          <FormSection title="Observaciones del Cliente">
            <ClientObservationSection />
          </FormSection>
          <FormSection title="Observaciones de Entrada">
            <InputObservationSection />
          </FormSection>
          <FormSection title="Mecánicos">
            <MechanicsSection />
          </FormSection>
          <FormSection title="Repuestos Usados">
            <RepuestosUsadosSection />
          </FormSection>
          <FormSection title="Reparación / Repuestos de terceros">
            <ReparacionTercerosSection />
          </FormSection>
          <FormSection title="Trabajos Realizados">
            <TrabajosRealizadosSection />
          </FormSection>
          <FormSection title="Resumen de Costos">
            <ResumenCostosSection />
          </FormSection>
          <FormActions />
        </form>
      </FormProvider>
      <FormSnackbar />
    </NuevaOrdenProvider>
  );
}

export default NuevaOrdenForm;
