import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import schema from "@/sections/ordenes-reparacion/nueva/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import FormActions from "../commons/FormActions";
import FormSection from "../commons/FormSection";
import AutoSection from "../sections/autos/AutoSection";
import ClientObservationSection from "../sections/client-observations/ClientObservationSection";
import HiddenObservationSection from "../sections/hidden-observations/HiddenObservationSection";
import InputObservationSection from "../sections/input-observations/InputObservationsSection";
import MechanicsSection from "../sections/mechanics/MechanicsSection";
import RecargoSection from "../sections/recargo-section/RecargoSection";
import ReparacionTercerosSection from "../sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "../sections/resumen-costos/ResumenCostosSection";
import TrabajosRealizadosSection from "../sections/trabajos-realizados/TrabajosRealizadosSection";

function NuevaOrdenForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ajustesPrecio: [],
      modoAjustes: "sobreTotalBase",
    },
  });
  const { handleSubmit, control } = methods;
  const { onSubmit } = useNuevaOrden({ control });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Información del Vehículo y Fechas">
          <AutoSection />
        </FormSection>
        <FormSection title="Observaciones del Cliente">
          <ClientObservationSection />
        </FormSection>
        <FormSection title="Observaciones último ingreso">
          <InputObservationSection />
        </FormSection>
        <FormSection title="Observaciones internas">
          <HiddenObservationSection />
        </FormSection>
        <FormSection title="Mecánicos">
          <MechanicsSection />
        </FormSection>
        <FormSection title="Reparación / Repuestos de terceros">
          <ReparacionTercerosSection />
        </FormSection>
        <FormSection title="Repuestos Usados">
          <RepuestosUsadosSection />
        </FormSection>
        <FormSection title="Recargo">
          <RecargoSection />
        </FormSection>
        <FormSection title="Trabajos Realizados">
          <TrabajosRealizadosSection />
        </FormSection>
        <FormSection title="Resumen de Costos">
          <ResumenCostosSection />
        </FormSection>
        <FormActions
          href="/dashboard/ordenes-reparacion"
          label="Orden de Reparación"
        />
      </form>
    </FormProvider>
  );
}

export default NuevaOrdenForm;
