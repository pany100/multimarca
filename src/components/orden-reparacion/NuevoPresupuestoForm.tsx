import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { presupuestoSchema } from "@/sections/ordenes-reparacion/nueva/schema";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import ConstructionIcon from "@mui/icons-material/Construction";
import HandymanIcon from "@mui/icons-material/Handyman";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Box } from "@mui/material";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

import usePresupuestoTemplate from "@/hooks/orden-reparacion/usePresupuestoTemplate";
import { Button, Link } from "@mui/material";

function NuevoPresupuestoForm({
  templateId,
}: {
  templateId: number | null | undefined;
}) {
  const methods = useForm({
    resolver: yupResolver(presupuestoSchema),
  });
  const {
    handleSubmit,
    formState: { errors, isSubmitted },
    control,
    watch,
    setValue,
  } = methods;
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const {
    presupuestoSubmit,
    snackbar,
    setSnackbar,
    manoDeObra,
    totalOrdenReparacion,
  } = useNuevaOrden({ control });
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  usePresupuestoTemplate({ templateId, setValue });
  const esBorrador = watch("esBorrador") || false;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(presupuestoSubmit)}>
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
            Información del Vehículo
          </Typography>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={6}
              ref={(el) => registerFieldRef("autoId", el)}
            >
              <CustomAutocompleteInput
                name="autoId"
                label="Vehículo"
                searchOptions={searchAutos}
                initialOptions={initialAuto}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="esBorrador"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Guardar como borrador"
                  />
                )}
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
          <Box display="flex" alignItems="center" mb={2}>
            <InventoryIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Repuestos Usados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RepuestoUsadoFormSection esBorrador={esBorrador} />
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
              <ReparacionesTercerosFormSection esBorrador={esBorrador} />
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
              <TrabajosRealizadosFormSection esBorrador={esBorrador} />
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
            href="/dashboard/presupuestos"
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
            Crear Presupuesto
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

export default NuevoPresupuestoForm;
