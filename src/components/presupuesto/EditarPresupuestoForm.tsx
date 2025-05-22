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

function EditarPresupuestoForm({ presupuesto }: { presupuesto: any }) {
  const methods = useForm({
    resolver: yupResolver(presupuestoSchema),
    defaultValues: {
      ...presupuesto,
      descuento: presupuesto.descuento,
      descripcionDescuento: presupuesto.descripcionDescuento,
      incremento: presupuesto.incremento,
      descripcionIncremento: presupuesto.descripcionIncremento,
      trabajosRealizados: presupuesto.trabajosRealizados.map(
        (trabajo: any) => ({
          manoDeObra: { name: trabajo.descripcion },
          precioUnitario: Number(trabajo.precioUnitario),
          diasParaRecordatorio: trabajo.diasParaRecordatorio,
          id: Math.floor(Math.random() * 1000000),
        })
      ),
      repuestosUsados: presupuesto.repuestosUsados.map((repuesto: any) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
        id: Math.floor(Math.random() * 1000000),
      })),
      reparacionesDeTercero: presupuesto.reparacionesDeTercero.map(
        (reparacion: any) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedorId,
            name: reparacion.proveedor.name,
          },
          recibo: reparacion.recibo,
          id: Math.floor(Math.random() * 1000000),
        })
      ),
    },
  });
  const { handleSubmit } = methods;
  const { handlePresupuestoEdit } = useNuevaOrden({
    control: methods.control,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handlePresupuestoEdit)}>
        <FormSection title="Información General">
          <PresupuestoInformacionGeneral />
        </FormSection>
        <FormSection title="Información del Vehículo">
          <PresupuestoAutoSection showBorrador={false} />
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
        <FormActions href="/dashboard/presupuestos" label="Presupuesto" />
      </form>
    </FormProvider>
  );
}

export default EditarPresupuestoForm;
