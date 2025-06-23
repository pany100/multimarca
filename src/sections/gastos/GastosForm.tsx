"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useCategoriasGasto from "@/hooks/useCategoriasGasto";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useMecanicoAutocomplete from "@/hooks/useMecanicoAutocomplete";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { getSchemaPropsForCheque } from "@/utils/chequeUtils";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  nombre: yup.string().required("El nombre es requerido"),
  precio: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup
    .string()
    .oneOf(["Peso", "Dolar"])
    .required("La moneda es requerida"),
  fecha: yup.date().required("La fecha es requerida"),
  detalle: yup.string().required("El detalle es requerido"),
  categoriaId: yup.number().required("La categoría es requerida"),
  mecanicoId: yup.number().when("categoriaId", {
    is: 2,
    then: (schema) => schema.required("El empleado es requerido"),
    otherwise: (schema) => schema.nullable(),
  }),
  proveedorId: yup.number().when("categoriaId", {
    is: 1,
    then: (schema) => schema.required("El proveedor es requerido"),
    otherwise: (schema) => schema.nullable(),
  }),
  tipoOperacionId: yup.number().required("El tipo de extracción es requerido"),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

const GastosForm = () => {
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("gasto");
  const { watch } = useFormContext();
  const operacionValue = watch("tipoOperacionId");
  const categoriaId = watch("categoriaId");
  const { categorias } = useCategoriasGasto();
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const { searchMecanicos, initialMecanico } = useMecanicoAutocomplete();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Gasto
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="nombre" label="Nombre" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="precio" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={currency} name="moneda" label="Moneda" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="categoriaId"
            label="Categoría"
            options={categorias}
          />
        </Grid>
        {categoriaId === 2 && (
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              name="mecanicoId"
              label="Empleado"
              searchOptions={searchMecanicos}
              initialOptions={initialMecanico}
            />
          </Grid>
        )}
        {categoriaId === 1 && (
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              name="proveedorId"
              label="Proveedor"
              searchOptions={searchProveedores}
              initialOptions={initialProveedor}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <CustomInputText name="detalle" label="Detalle" multiline rows={3} />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            options={tiposOperacion}
            name="tipoOperacionId"
            label="Tipo de Operación"
          />
        </Grid>
        {operacionValue === 3 && <ChequeData />}
      </Grid>
    </>
  );
};

export default GastosForm;
