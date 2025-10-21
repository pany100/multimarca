"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useOrdenReparacionDelCliente from "@/hooks/useOrdenReparacionDelCliente";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { getSchemaPropsForCheque } from "@/utils/chequeUtils";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  descripcion: yup.string().required("La descripción es requerida"),
  clienteId: yup.number().required("El cliente es requerido"),
  ordenReparacionId: yup
    .number()
    .required("La orden de reparación es requerida"),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotización es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),
  gastosBancarios: yup.number().default(0),
  gastosArba: yup.number().default(0),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

const IngresosReparacionForm = () => {
  const { watch } = useFormContext();

  const { currency } = useFixedSelectData();
  const { searchClientes, initialCliente } = useClientesAutocomplete();
  const { tiposOperacion } = useTipoOperacion("ingreso");
  const clienteId = watch("clienteId");
  const { ordenesReparacion } = useOrdenReparacionDelCliente(clienteId);
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
          <CustomInputText
            name="cotizacionDolar"
            label="Cotización Dolar"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="gastosBancarios"
            label="Gastos Bancarios (en pesos)"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="gastosArba"
            label="Gastos ARBA (en pesos)"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="tipoOperacionId"
            label="Tipo de Operación"
            options={tiposOperacion}
          />
        </Grid>
        {(operacionValue === 3 || operacionValue === 9) && <ChequeData />}
        <Grid item xs={12}>
          <CustomAutocomplete
            name="clienteId"
            label="Cliente"
            searchOptions={searchClientes}
            initialOptions={initialCliente}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            name="ordenReparacionId"
            label="Orden de Reparación"
            options={ordenesReparacion}
          />
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

export default IngresosReparacionForm;
