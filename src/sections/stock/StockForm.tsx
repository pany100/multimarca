import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  brand: yup.string().required("La marca es requerida"),
  buyPrice: yup.number().nullable(),
  restockValue: yup.number().nullable(),
  label: yup.string().nullable(),
  markup: yup.number().nullable(),
  proveedorId: yup.number().required("El proveedor es requerido"),
});

export const unitsSchema = yup.object({
  units: yup.number().required("Las unidades son requeridas"),
  name: yup.string().required("El nombre es requerido"),
  brand: yup.string().required("La marca es requerida"),
  buyPrice: yup.number().nullable(),
  restockValue: yup.number().nullable(),
  label: yup.string().nullable(),
  markup: yup.number().nullable(),
  proveedorId: yup.number().required("El proveedor es requerido"),
});

const StockForm = () => {
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Stock
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="name" label="Nombre" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="brand" label="Marca" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="buyPrice"
            label="Precio de compra"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="restockValue"
            label="Valor de reposición"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="label" label="Rótulo" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="markup" label="Margen" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomAutocomplete
            name="proveedorId"
            label="Proveedor"
            searchOptions={searchProveedores}
            initialOptions={initialProveedor}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StockForm;
