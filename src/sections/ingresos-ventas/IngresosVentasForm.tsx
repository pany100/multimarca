"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { getSchemaPropsForCheque } from "@/utils/chequeUtils";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import useVentasDelCliente from "../ventas/hooks/useVentasDelCliente";
import IngresoVentaClienteSection from "./IngresoVentaClienteSection";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  descripcion: yup.string().required("La descripción es requerida"),
  clienteId: yup.number().nullable(),
  informacionCliente: yup.string().nullable(),
  ventaId: yup.number().required("La venta es requerida"),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

const IngresosVentasForm = () => {
  const { watch } = useFormContext();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("ingreso");

  const { ventas } = useVentasDelCliente();
  const operacionValue = watch("tipoOperacionId");
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Ingreso
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="monto" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect name="moneda" label="Moneda" options={currency} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="tipoOperacionId"
            label="Tipo de Operación"
            options={tiposOperacion}
          />
        </Grid>
        {operacionValue === 3 && <ChequeData />}
        <Grid
          item
          xs={12}
          sx={{ border: "1px solid #ccc", ml: 2, mt: 2, mb: 2, p: 2 }}
        >
          <IngresoVentaClienteSection />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect name="ventaId" label="Venta" options={ventas} />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="descripcion"
            label="Descripción"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default IngresosVentasForm;
