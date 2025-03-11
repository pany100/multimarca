import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  precioTotal: yup.number().required("El precio total es requerido"),
  proveedorId: yup.number().required("El proveedor es requerido"),
  items: yup
    .array()
    .of(
      yup.object({
        cantidad: yup.number().required("La cantidad es requerida"),
        stockId: yup.number().required("El stock es requerido"),
      })
    )
    .min(1, "Debe agregar al menos un item"),
});

function OrdenDeCompraForm() {
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const {
    formState: { errors },
    watch,
  } = useFormContext();
  const [openModal, setOpenModal] = useState(false);
  const proveedorId = watch("proveedorId");
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agregar orden de compra
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomAutocomplete
            name="proveedorId"
            label="Proveedor"
            searchOptions={searchProveedores}
            initialOptions={initialProveedor}
          />
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="precioTotal"
            label="Precio Total"
            type="number"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default OrdenDeCompraForm;
