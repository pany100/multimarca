"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  descripcion: yup.string().required("La descripción es requerida"),
  moneda: yup
    .string()
    .oneOf(["Peso", "Dolar"])
    .required("La moneda es requerida"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotización es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),
  cancelado: yup.boolean().default(false),
});

const PerdidaForm = () => {
  const { currency } = useFixedSelectData();
  const { control } = useFormContext();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información de la Pérdida
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="monto" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={currency} name="moneda" label="Moneda" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="cotizacionDolar"
            label="Cotización Dolar"
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="descripcion"
            label="Descripción"
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="cancelado"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Cancelado"
              />
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default PerdidaForm;
