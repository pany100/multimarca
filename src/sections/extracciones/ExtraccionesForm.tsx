"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useAdmins from "@/hooks/useAdmins";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { getSchemaPropsForCheque } from "@/utils/chequeUtils";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  fecha: yup.date().required("La fecha es requerida"),
  moneda: yup
    .string()
    .oneOf(["Peso", "Dolar"])
    .required("La moneda es requerida"),
  usuarioId: yup.number().required("El usuario es requerido"),
  motivo: yup.string().required("El motivo es requerido"),
  tipoExtraccion: yup
    .string()
    .oneOf([
      "EFECTIVO",
      "TRANSFERENCIA",
      "CHEQUE",
      "DEBITO_AUTOMATICO_TARJETA_CREDITO",
    ])
    .required("El tipo de extracción es requerido"),
  ...getSchemaPropsForCheque("tipoExtraccion"),
});

const ExtraccionesForm = () => {
  const { admins } = useAdmins();
  const { currency, tipoOperacion } = useFixedSelectData();
  const { watch } = useFormContext();
  const operacionValue = watch("tipoExtraccion");

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información de la Extracción
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="monto" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={currency} name="moneda" label="Moneda" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={admins} name="usuarioId" label="Usuario" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText name="motivo" label="Motivo" />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            options={tipoOperacion}
            name="tipoExtraccion"
            label="Tipo de Extracción"
          />
        </Grid>
        {operacionValue === "CHEQUE" && <ChequeData />}
      </Grid>
    </>
  );
};

export default ExtraccionesForm;
