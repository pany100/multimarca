import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import schema from "@/sections/ordenes-reparacion/nueva/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, Paper, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import CustomAutocomplete from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";
import CustomSelect from "../formV2/CustomSelect";

function NuevaOrdenForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit } = methods;

  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { orepEstadoOptions } = useFixedSelectData();
  const onSubmit = () => {};

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
      </form>
    </FormProvider>
  );
}

export default NuevaOrdenForm;
