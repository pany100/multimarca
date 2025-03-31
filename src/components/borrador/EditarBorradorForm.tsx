import useBorradorForm from "@/hooks/borrador/useBorradorForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import FormActions from "../orden-reparacion/formV2/commons/FormActions";
import FormSection from "../orden-reparacion/formV2/commons/FormSection";
import ClientObservationSection from "../orden-reparacion/formV2/sections/client-observations/ClientObservationSection";
import ReparacionTercerosSection from "../orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "../orden-reparacion/formV2/sections/resumen-costos/ResumenCostosSection";
import TrabajosRealizadosSection from "../orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";
import PresupuestoAutoSection from "../presupuesto/PresupuestoAutoSection";
import schema from "./schema";

type Props = {
  borrador: {
    id: number;
    autoId: number;
    auto: {
      id: number;
      patent: string;
      brand?: string;
      model?: string;
    };
    observacionesCliente: string;
    repuestosUsados: {
      stock: {
        id: number;
        name: string;
      };
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
    }[];
    trabajosRealizados: {
      id: number;
      ordenReparacionId: number;
      descripcion: string;
      precioUnitario: number;
      diasParaRecordatorio?: number;
    }[];
    reparacionesDeTercero: {
      nombre: string;
      precioCompra?: number;
      precioVenta?: number;
      proveedor: {
        id: number;
        name: string;
      };
    }[];
    descuento: number;
    observacionesEntrada?: string;
  };
};

function EditarBorradorForm({ borrador }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...borrador,
      esBorrador: true,
      trabajosRealizados: borrador.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
        id: Math.floor(Math.random() * 1000000),
      })),
      repuestosUsados: borrador.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stock.id, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
        id: Math.floor(Math.random() * 1000000),
      })),
      reparacionesDeTercero: borrador.reparacionesDeTercero.map(
        (reparacion) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedor.id,
            name: reparacion.proveedor.name,
          },
          id: Math.floor(Math.random() * 1000000),
        })
      ),
    },
  });
  const { handleSubmit } = methods;
  const { onSubmit } = useBorradorForm(borrador.id);
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Información del Vehículo">
          <PresupuestoAutoSection />
        </FormSection>
        <FormSection title="Observaciones del Cliente">
          <ClientObservationSection />
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
        <FormActions href="/dashboard/presupuestos" label="Borrador" />
      </form>
    </FormProvider>
  );
}

export default EditarBorradorForm;
