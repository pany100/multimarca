"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useAdmins from "@/hooks/useAdmins";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
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
  tipoOperacionId: yup.number().required("El tipo de extracción es requerido"),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

const ExtraccionesForm = () => {
  const { admins } = useAdmins();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("gasto");
  const { watch } = useFormContext();
  const operacionValue = watch("tipoOperacionId");

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
            options={tiposOperacion}
            name="tipoOperacionId"
            label="Tipo de Operación"
          />
        </Grid>
        {(operacionValue === 3 || operacionValue === 9) && <ChequeData />}
      </Grid>
    </>
  );
};

export default ExtraccionesForm;
