import useEditOrden from "@/hooks/orden-reparacion/useEditOrden";
import schema from "@/sections/ordenes-reparacion/editar/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormActions from "../commons/FormActions";
import FormSection from "../commons/FormSection";
import RecibosSection from "../commons/RecibosSection";
import ScannerForm from "../commons/ScannerForm";
import AutoSection from "../sections/autos/AutoSection";
import ClientObservationSection from "../sections/client-observations/ClientObservationSection";
import ControlesSection from "../sections/controles/ControlesSection";
import DetalleControlesSection from "../sections/detalle-controles/DetalleControlesSection";
import HiddenObservationSection from "../sections/hidden-observations/HiddenObservationSection";
import InputObservationSection from "../sections/input-observations/InputObservationsSection";
import MechanicsSection from "../sections/mechanics/MechanicsSection";
import OutputObservationsSection from "../sections/output-observations/OutputObservationsSection";
import ReparacionTercerosSection from "../sections/reparacion-terceros/ReparacionTercerosSection";
import RepuestosUsadosSection from "../sections/repuestos-usados/RepuestosUsadosSection";
import ResumenCostosSection from "../sections/resumen-costos/ResumenCostosSection";
import RevisionSection from "../sections/revision/RevisionSection";
import TrabajosRealizadosSection from "../sections/trabajos-realizados/TrabajosRealizadosSection";

type Props = {
  ordenReparacion: OrdenReparacion;
};

type OrdenReparacion = {
  id: number;
  autoId: number;
  fechaCreacion: Date;
  fechaEntradaReparacion: Date | null;
  fechaSalidaReparacion: Date | null;
  kilometros: number;
  observacionesCliente: string;
  observacionesEntrada: string;
  observacionesSalida: string;
  estado:
    | "Presupuestado"
    | "EnProgreso"
    | "Aceptado"
    | "Terminado"
    | "SeRetira"
    | "Incobrable";
  pdfPath: string | null;
  manoDeObra: number;
  auto: {
    id: number;
    patent: string;
    model: string;
    brand: string;
  };
  mecanicos: any[];
  repuestosUsados: {
    id: number;
    ordenReparacionId: number;
    stockId: number;
    stock: {
      id: number;
      name: string;
      label: string;
      proveedor: {
        name: string;
      };
    };
    label: string;
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
    ordenReparacionId: number;
    descripcion: string;
    precioUnitario: number;
    diasParaRecordatorio?: number;
  }[];
  controlesEnReparacion: {
    id: number;
    valor: string;
    controlMecanico: {
      id: number;
      name: string;
      type: string;
      ordenEnPdf: number | null;
      pdfName: string | null;
      parent: {
        id: number;
        name: string;
      } | null;
    };
  }[];
  descuento: number;
  descripcionDescuento: string;
  incremento: number;
  descripcionIncremento: string;
  detalleControles: string;
  recibos: string[];
};

function EditarOrdenForm({ ordenReparacion }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...ordenReparacion,
      descuento: ordenReparacion.descuento,
      descripcionDescuento: ordenReparacion.descripcionDescuento,
      incremento: ordenReparacion.incremento,
      descripcionIncremento: ordenReparacion.descripcionIncremento,
      trabajosRealizados: ordenReparacion.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
        id: Math.floor(Math.random() * 1000000),
      })),
      repuestosUsados: ordenReparacion.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        proveedor: repuesto.stock.proveedor.name,
        label: repuesto.stock.label,
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
        id: Math.floor(Math.random() * 1000000),
      })),
      reparacionesDeTercero: ordenReparacion.reparacionesDeTercero.map(
        (reparacion) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedorId,
            name: reparacion.proveedor.name,
          },
          recibo: reparacion.recibo,
          id: Math.floor(Math.random() * 1000000),
        }),
      ),
      observacionesSalida: ordenReparacion.observacionesSalida,
      controlesEnReparacion: ordenReparacion.controlesEnReparacion.map(
        (control) => ({
          id: control.id,
          valor: control.valor,
          type: control.controlMecanico.type,
          name: control.controlMecanico.name,
          ordenEnPdf: control.controlMecanico.ordenEnPdf,
          pdfName: control.controlMecanico.pdfName,
          parent: control.controlMecanico.parent,
        }),
      ),
    },
  });
  const { handleSubmit, control } = methods;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { onSubmit } = useEditOrden({
    control,
    ordenReparacion,
    selectedFile,
  });
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
        <FormSection title="Observaciones de salida">
          <OutputObservationsSection />
        </FormSection>
        <FormSection title="Controles">
          <ControlesSection />
        </FormSection>
        <FormSection title="Mecánicos">
          <MechanicsSection />
        </FormSection>
        <FormSection title="Revisión">
          <RevisionSection />
        </FormSection>
        <FormSection title="Trabajos Realizados">
          <DetalleControlesSection />
        </FormSection>
        <FormSection title="Reparación / Repuestos de terceros">
          <ReparacionTercerosSection />
        </FormSection>
        <FormSection title="Repuestos Usados">
          <RepuestosUsadosSection />
        </FormSection>
        <FormSection title="Mano de Obra">
          <TrabajosRealizadosSection />
        </FormSection>
        <FormSection title="Resumen de Costos">
          <ResumenCostosSection />
        </FormSection>
        <FormSection title="Informe del Scanner">
          <ScannerForm
            ordenReparacion={ordenReparacion}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </FormSection>
        <FormSection title="Recibos">
          <RecibosSection />
        </FormSection>
        <FormActions
          href="/dashboard/ordenes-reparacion"
          label="Orden de Reparación"
        />
      </form>
    </FormProvider>
  );
}

export default EditarOrdenForm;
