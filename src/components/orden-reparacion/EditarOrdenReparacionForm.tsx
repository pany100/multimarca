import schema from "@/sections/ordenes-reparacion/editar/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import { getFormattedPrice } from "@/utils/fieldHelper";
import ConstructionIcon from "@mui/icons-material/Construction";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HandymanIcon from "@mui/icons-material/Handyman";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";
import CustomAutocomplete from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";
import CustomSelect from "../formV2/CustomSelect";
import TextListInput from "../TextListInput";
import ControlesEnReparacionForm from "./ControlesEnReparacionForm";
import MecanicoFormSection from "./MecanicoFormSection";
import ObservacionesEntradaForm from "./ObservacionesEntradaForm";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import ScannerForm from "./ScannerForm";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

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
  const {
    handleSubmit,
    formState: { errors, isSubmitted },
    control,
    setValue,
  } = methods;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { orepEstadoOptions } = useFixedSelectData();
  const { snackbar, setSnackbar, manoDeObra, totalOrdenReparacion } =
    useNuevaOrden({ control });

  const onSubmit = (data: any) => {};
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            Información del Vehículo y Fechas
          </Typography>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("autoId", el)}
            >
              <CustomAutocomplete
                name="autoId"
                label="Vehículo"
                searchOptions={searchAutos}
                initialOptions={initialAuto}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("kilometros", el)}
            >
              <CustomInputText
                name="kilometros"
                label="Kilómetros"
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("estado", el)}
            >
              <CustomSelect
                name="estado"
                label="Estado"
                options={orepEstadoOptions}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("fechaCreacion", el)}
            >
              <CustomInputText
                name="fechaCreacion"
                label="Fecha de Creación"
                type="date"
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("fechaEntradaReparacion", el)}
            >
              <CustomInputText
                name="fechaEntradaReparacion"
                label="Fecha de Entrada a Reparación"
                type="date"
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              ref={(el) => registerFieldRef("fechaSalidaReparacion", el)}
            >
              <CustomInputText
                name="fechaSalidaReparacion"
                label="Fecha de Salida de Reparación"
                type="date"
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            Observaciones del Cliente
          </Typography>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              ref={(el) => registerFieldRef("observacionesCliente", el)}
            >
              <CustomInputText
                name="observacionesCliente"
                label="Detalles proporcionados por el cliente"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            Observaciones de entrada
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ObservacionesEntradaForm />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <EngineeringIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Mecánicos
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MecanicoFormSection />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <InventoryIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Repuestos Usados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RepuestoUsadoFormSection />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <HandymanIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Reparación / Repuestos de terceros
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ReparacionesTercerosFormSection />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <ConstructionIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Trabajos Realizados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TrabajosRealizadosFormSection />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" textAlign="right">
                Mano de obra:{" "}
                {isNaN(manoDeObra)
                  ? "0"
                  : getFormattedPrice(manoDeObra.toFixed(2))}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <ConstructionIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Controles Realizados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ControlesEnReparacionForm
                controlesMecanicos={ordenReparacion.controlesEnReparacion.map(
                  (control) => ({
                    id: control.id,
                    nombre: control.controlMecanico.name,
                    tipo:
                      control.controlMecanico.type === "checkbox"
                        ? "checkbox"
                        : "texto",
                    valor: control.valor,
                  })
                )}
              />
            </Grid>
          </Grid>
          <Grid container sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <TextListInput
                  inputName="detalleControles"
                  label="Detalle de controles"
                />
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <PictureAsPdfIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Informe del Scanner
            </Typography>
          </Box>
          <ScannerForm
            ordenReparacion={ordenReparacion}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <PaidIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Resumen de Costos
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4} ref={(el) => registerFieldRef("descuento", el)}>
              <CustomInputText
                name="descuento"
                label="Descuento"
                type="number"
              />
            </Grid>

            <Grid
              item
              xs={8}
              ref={(el) => registerFieldRef("descripcionDescuento", el)}
            >
              <CustomInputText
                name="descripcionDescuento"
                label="Descripción del descuento"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 1,
                  backgroundColor: "primary.lighter",
                  borderRadius: 1,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    Total Orden de Reparación
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ${" "}
                    {isNaN(totalOrdenReparacion)
                      ? "0.00"
                      : totalOrdenReparacion.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </FormProvider>
  );
}

export default EditarOrdenReparacionForm;
