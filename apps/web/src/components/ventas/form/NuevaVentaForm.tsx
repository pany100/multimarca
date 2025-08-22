import FormActions from "@/components/orden-reparacion/formV2/commons/FormActions";
import FormSection from "@/components/orden-reparacion/formV2/commons/FormSection";
import IncrementoSection from "@/components/orden-reparacion/formV2/sections/incremento/IncrementoSection";
import RecargoSection from "@/components/orden-reparacion/formV2/sections/recargo-section/RecargoSection";
import ReparacionTercerosSection from "@/components/orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "@/components/orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "@/components/orden-reparacion/formV2/sections/resumen-costos/ResumenCostosSection";
import TrabajosRealizadosSection from "@/components/orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";
import useNuevaVenta from "@/sections/ventas/hooks/useNuevaVenta";
import { schema } from "@/sections/ventas/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import VentasClienteSection from "./VentasClienteSection";
import VentasDatosGeneralesSection from "./VentasDatosGeneralesSection";

function NuevaVentaForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit, control } = methods;
  const { onSubmit } = useNuevaVenta({ control });
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Datos Generales">
          <VentasDatosGeneralesSection />
          <Box sx={{ mt: 2 }}>
            <VentasClienteSection />
          </Box>
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
        <FormSection title="Incremento">
          <IncrementoSection />
        </FormSection>
        <FormSection title="Resumen de Costos">
          <ResumenCostosSection isVenta={true} />
        </FormSection>
        <FormActions href="/dashboard/ventas" label="Ventas" />
      </form>
    </FormProvider>
  );
}

export default NuevaVentaForm;
