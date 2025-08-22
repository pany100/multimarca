import usePlantillaForm from "@/hooks/plantilla/usePlantillaForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import schema from "./schema";

import { Box } from "@mui/material";
import { FormProvider } from "react-hook-form";
import CustomInputText from "../formV2/CustomInputText";
import FormActions from "../orden-reparacion/formV2/commons/FormActions";
import FormSection from "../orden-reparacion/formV2/commons/FormSection";
import ReparacionTercerosSection from "../orden-reparacion/formV2/sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../orden-reparacion/formV2/sections/repuestos-usados/RepuestosUsadosSection";
import TrabajosRealizadosSection from "../orden-reparacion/formV2/sections/trabajos-realizados/TrabajosRealizadosSection";

type PlantillaPresupuesto = {
  id: number;
  nombre: string;
  repuestosUsados: {
    id: number;
    ordenReparacionId: number;
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
  }[];
  trabajosRealizados: {
    id: number;
    ordenReparacionId: number;
    descripcion: string;
    precioUnitario: number;
    diasParaRecordatorio?: number;
  }[];
  manoDeObra: number;
};

type Props = {
  plantilla: PlantillaPresupuesto;
};

function EditarPlantillaForm({ plantilla }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...plantilla,
      trabajosRealizados: plantilla.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
        id: Math.floor(Math.random() * 1000000),
      })),
      repuestosUsados: plantilla.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
        id: Math.floor(Math.random() * 1000000),
      })),
      reparacionesDeTercero: plantilla.reparacionesDeTercero.map(
        (reparacion) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedorId,
            name: reparacion.proveedor.name,
          },
          id: Math.floor(Math.random() * 1000000),
        })
      ),
    },
  });
  const { handleSubmit } = methods;
  const { onEditSubmit } = usePlantillaForm(plantilla.id);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onEditSubmit)}>
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

export default EditarPlantillaForm;
