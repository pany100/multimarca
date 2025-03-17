import schema from "@/sections/ordenes-reparacion/editar/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

import useEditOrden from "@/hooks/orden-reparacion/useEditOrden";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Box, Button, Link, Snackbar } from "@mui/material";
import { useState } from "react";
import AutoFormSection from "./form/commons/AutoFormSection";
import ClientObservationSection from "./form/commons/ClientObservationSection";
import InputObservationsSection from "./form/commons/InputObservationsSection";
import MecanicosSection from "./form/commons/MecanicosSection";
import PriceSection from "./form/commons/PriceSection";
import ReparacionesSection from "./form/commons/ReparacionesSection";
import RepuestosUsadosSection from "./form/commons/RepuestosUsadosSection";
import TrabajosSection from "./form/commons/TrabajosSection";
import ControlesSection from "./form/editar/ControlesSection";
import ScannerSection from "./form/editar/ScannerSection";

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
  estado: "Presupuestado" | "EnProgreso" | "Aceptado" | "Terminado";
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
    };
  }[];
  descuento: number;
  descripcionDescuento: string;
  detalleControles: string;
};

function EditarOrdenReparacionForm({ ordenReparacion }: Props) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...ordenReparacion,
      descuento: ordenReparacion.descuento,
      descripcionDescuento: ordenReparacion.descripcionDescuento,
      trabajosRealizados: ordenReparacion.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })),
      repuestosUsados: ordenReparacion.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
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
        })
      ),
      observacionesSalida: ordenReparacion.observacionesSalida,
      controlesEnReparacion: ordenReparacion.controlesEnReparacion.map(
        (control) => ({
          id: control.id,
          valor: control.valor,
        })
      ),
    },
  });
  const { handleSubmit, control } = methods;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { snackbar, setSnackbar, onSubmit } = useEditOrden({
    control,
    ordenReparacion,
    selectedFile,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AutoFormSection />
        <ClientObservationSection />
        <InputObservationsSection />
        <MecanicosSection />
        <RepuestosUsadosSection />
        <ReparacionesSection />
        <TrabajosSection />
        <ControlesSection ordenReparacion={ordenReparacion} />
        <ScannerSection
          ordenReparacion={ordenReparacion}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
        <PriceSection />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/dashboard/ordenes-reparacion"
          >
            Volver a la lista
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            sx={{
              px: 4,
              py: 1,
            }}
          >
            Editar Orden de Reparación
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}

export default EditarOrdenReparacionForm;
