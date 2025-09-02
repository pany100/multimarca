import FormActions from "@/components/orden-reparacion/formV2/commons/FormActions";
import FormSection from "@/components/orden-reparacion/formV2/commons/FormSection";
import RecargoSection from "@/components/orden-reparacion/formV2/sections/recargo-section/RecargoSection";
import ReparacionTercerosSection from "@/components/orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "@/components/orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "@/components/orden-reparacion/formV2/sections/resumen-costos/ResumenCostosSection";
import TrabajosRealizadosSection from "@/components/orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";
import useEditVenta from "@/sections/ventas/hooks/useEditVenta";
import { schema } from "@/sections/ventas/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { EstadoVenta } from "@prisma/client";
import { FormProvider, useForm } from "react-hook-form";
import VentasClienteSection from "./VentasClienteSection";
import VentasDatosGeneralesSection from "./VentasDatosGeneralesSection";

type Venta = {
  id: number;
  fecha: Date;
  clienteId: number;
  estado: string;
  repuestosUsados: {
    id: number;
    ventaId: number;
    stockId: number;
    stock: {
      id: number;
      name: string;
    };
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
  reparacionesDeTercero: {
    id: number;
    nombre: string;
    precioCompra: number;
    precioVenta: number;
    proveedorId: number;
    proveedor: {
      id: number;
      name: string;
    };
    recibo: string;
  }[];
  trabajosRealizados: {
    id: number;
    ventaId: number;
    descripcion: string;
    precioUnitario: number;
    diasParaRecordatorio?: number;
  }[];
  descuento: number;
  descripcionDescuento: string;
  incremento: number;
  descripcionIncremento: string;
};

function EditarVentaForm({ venta }: { venta: Venta }) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...venta,
      descuento: venta.descuento,
      descripcionDescuento: venta.descripcionDescuento,
      incremento: venta.incremento,
      descripcionIncremento: venta.descripcionIncremento,
      estado: venta.estado as EstadoVenta,
      trabajosRealizados: venta.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
        id: Math.floor(Math.random() * 1000000),
      })),
      repuestosUsados: venta.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
        id: Math.floor(Math.random() * 1000000),
      })),
      reparacionesDeTercero: venta.reparacionesDeTercero.map((reparacion) => ({
        nombre: reparacion.nombre,
        precioCompra: Number(reparacion.precioCompra),
        precioVenta: Number(reparacion.precioVenta),
        proveedor: {
          id: reparacion.proveedorId,
          name: reparacion.proveedor.name,
        },
        recibo: reparacion.recibo,
        id: Math.floor(Math.random() * 1000000),
      })),
    },
  });
  const { handleSubmit, control } = methods;
  const { onSubmit } = useEditVenta({
    control,
    venta,
  });
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
        <FormSection title="Resumen de Costos">
          <ResumenCostosSection isVenta={true} />
        </FormSection>
        <FormActions href="/dashboard/ventas" label="Ventas" />
      </form>
    </FormProvider>
  );
}

export default EditarVentaForm;
