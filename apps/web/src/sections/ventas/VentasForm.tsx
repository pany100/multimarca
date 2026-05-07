"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import {
  CHEQUE_OPERACION_IDS,
  getSchemaPropsForCheque,
} from "@/utils/chequeUtils";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import ItemsTable from "../commons/ItemsTable";
import VentasItemsModal from "./VentasItemsModal";

export const schema = yup.object({
  presupuesto: yup.boolean().required("El presupuesto es requerido"),
  fecha: yup.date().required("La fecha es requerida"),
  moneda: yup.string().required("La moneda es requerida"),
  total: yup.number().required("El total es requerido"),
  clienteId: yup.number().required("El cliente es requerido"),
  items: yup
    .array()
    .of(
      yup.object({
        cantidad: yup.number().required("La cantidad es requerida"),
        name: yup.string(),
        stockId: yup.number().required("El stock es requerido"),
      })
    )
    .min(1, "Debe agregar al menos un item"),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

function VentasForm() {
  const { searchClientes, initialCliente } = useClientesAutocomplete();
  const { currency } = useFixedSelectData();

  const { watch } = useFormContext();
  const [openModal, setOpenModal] = useState(false);
  const clienteId = watch("clienteId");
  const operacionValue = watch("tipoOperacionId");
  const { tiposOperacion } = useTipoOperacion("ingreso");
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agregar venta
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Controller
                name="presupuesto"
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.checked)
                    }
                  />
                )}
              />
            }
            label="¿Es presupuesto?"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomAutocomplete
            name="clienteId"
            label="Cliente"
            searchOptions={searchClientes}
            initialOptions={initialCliente}
          />
        </Grid>
        <Grid item xs={12}>
          <ItemsTable />
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 2 }}
          >
            <Button variant="outlined" onClick={() => setOpenModal(true)}>
              Agregar Item
            </Button>
          </Box>
          <VentasItemsModal
            open={openModal}
            onClose={() => setOpenModal(false)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            options={tiposOperacion}
            name="tipoOperacion"
            label="Tipo de Operación"
          />
        </Grid>
        {CHEQUE_OPERACION_IDS.includes(operacionValue) && <ChequeData />}
        <Grid item xs={12} md={6}>
          <CustomSelect options={currency} name="moneda" label="Moneda" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="total" label="Precio Total" type="number" />
        </Grid>
      </Grid>
    </>
  );
}

export default VentasForm;
