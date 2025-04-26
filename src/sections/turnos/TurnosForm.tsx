"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputDate from "@/components/formV2/CustomInputDate"; // updated import
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomInputTime from "@/components/formV2/CustomInputTime"; // new import
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import { Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useWatch } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup
    .date()
    .required("La fecha es requerida")
    .min(
      dayjs().startOf("day").toDate(),
      "No se puede crear un turno para una fecha pasada"
    ),
  hora: yup.string().required("La hora es requerida"),
  problema: yup
    .string()
    .required("La descripción del problema es requerida")
    .max(255, "La descripción no puede exceder los 255 caracteres"),
  autoId: yup
    .number()
    .required("El auto es requerido")
    .positive("El auto es requerido"),
});

const TurnosForm = () => {
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const watch = useWatch();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Turno
      </Typography>
      {JSON.stringify(watch)}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputDate name="fecha" label="Fecha" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputTime
            name="hora"
            label="Hora"
            minTime="08:00"
            maxTime="17:00"
            minutesStep={30}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomAutocompleteInput
            name="autoId"
            label="Vehículo"
            searchOptions={searchAutos}
            initialOptions={initialAuto}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="problema"
            label="Descripción del problema"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TurnosForm;
