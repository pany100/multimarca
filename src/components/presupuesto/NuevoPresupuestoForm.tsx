import usePresupuestoTemplate from "@/hooks/orden-reparacion/usePresupuestoTemplate";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import { presupuestoSchema } from "@/sections/ordenes-reparacion/nueva/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import FormActions from "../orden-reparacion/formV2/commons/FormActions";
import FormSection from "../orden-reparacion/formV2/commons/FormSection";
import ClientObservationSection from "../orden-reparacion/formV2/sections/client-observations/ClientObservationSection";
import ReparacionTercerosSection from "../orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "../orden-reparacion/formV2/sections/resumen-costos/ResumenCostosSection";
import TrabajosARealizarSection from "../orden-reparacion/formV2/sections/trabajos-a-realizar/TrabajosARealizarSection";
import TrabajosRealizadosSection from "../orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";
import PresupuestoAutoSection from "./PresupuestoAutoSection";
import PresupuestoInformacionGeneral from "./PresupuestoInformacionGeneral";

function NuevoPresupuestoForm({
  templateId,
}: {
  templateId: number | null | undefined;
}) {
  const methods = useForm({
    resolver: yupResolver(presupuestoSchema),
  });
  const { control, handleSubmit, setValue } = methods;
  usePresupuestoTemplate({ templateId, setValue });
  const { presupuestoSubmit } = useNuevaOrden({ control });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(presupuestoSubmit)}>
        <FormSection title="Información General">
          <PresupuestoInformacionGeneral />
        </FormSection>
        <FormSection title="Información del Vehículo">
          <PresupuestoAutoSection />
        </FormSection>
        <FormSection title="Pedido del Cliente">
          <ClientObservationSection />
        </FormSection>
        <FormSection title="Trabajos a realizar">
          <TrabajosARealizarSection />
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
        <FormActions href="/dashboard/presupuesto" label="Presupuesto" />
      </form>
    </FormProvider>
  );
}

export default NuevoPresupuestoForm;
