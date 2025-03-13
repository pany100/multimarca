import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import schema from "@/sections/ordenes-reparacion/nueva/schema";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
} from "@/utils/ordenHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConstructionIcon from "@mui/icons-material/Construction";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HandymanIcon from "@mui/icons-material/Handyman";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";

import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Box,
  Button,
  Grid,
  Link,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import CustomAutocomplete from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";
import CustomSelect from "../formV2/CustomSelect";
import MecanicoFormSection from "./MecanicoFormSection";
import ObservacionesEntradaForm from "./ObservacionesEntradaForm";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

function NuevaOrdenForm() {
  const { authFetch } = useFetch();
  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { orepEstadoOptions } = useFixedSelectData();
  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizados = useWatch({ control, name: "trabajosRealizados" });
  const autoId = useWatch({ control, name: "autoId" });
  const descuento = useWatch({ control, name: "descuento" }) || 0;
  const manoDeObra = calcularManoDeObra(trabajosRealizados ?? []);
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: repuestosUsados ?? [],
    reparacionesDeTercero: reparacionesTerceros ?? [],
    trabajosRealizados: trabajosRealizados ?? [],
    descuento,
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/orden-reparacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ordenes-reparacion");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la orden de reparación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };
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
            <Grid item xs={12} md={4}>
              <CustomAutocomplete
                name="autoId"
                label="Vehículo"
                searchOptions={searchAutos}
                initialOptions={initialAuto}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomInputText
                name="kilometros"
                label="Kilómetros"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomInputText
                name="fechaCreacion"
                label="Fecha de Creación"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomInputText
                name="fechaEntradaReparacion"
                label="Fecha de Entrada a Reparación"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomInputText
                name="fechaSalidaReparacion"
                label="Fecha de Salida de Reparación"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                name="estado"
                label="Estado"
                options={orepEstadoOptions}
              />
            </Grid>
          </Grid>
        </Paper>
        {/* Client Observations */}
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
            <Grid item xs={12}>
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
            <PaidIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Resumen de Costos
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomInputText
                name="descuento"
                label="Descuento"
                type="number"
              />
            </Grid>

            <Grid item xs={8}>
              <CustomInputText
                name="descripcionDescuento"
                label="Descripción del descuento"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" component="h2" textAlign="right">
                Total Orden de Reparación:{" "}
                {isNaN(totalOrdenReparacion)
                  ? "0"
                  : totalOrdenReparacion.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
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
            Crear Orden de Reparación
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity as "success" | "error"}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}

export default NuevaOrdenForm;
