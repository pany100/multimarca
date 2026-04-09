import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import ItemsTable from "../commons/ItemsTable";
import ItemsModal from "./ItemsModal";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  proveedorId: yup.number().required("El proveedor es requerido"),
  items: yup
    .array()
    .of(
      yup.object({
        cantidad: yup.number().required("La cantidad es requerida"),
        name: yup.string(),
        stockId: yup.number().required("El stock es requerido"),
        precioUnitario: yup.number().nullable(),
        iva: yup.number().nullable(),
      }),
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
  const items = watch("items") || [];
  const precioTotalGuardado = watch("precioTotal");

  const precioTotalCalculado = items.reduce((total: number, item: any) => {
    const precio = Number(item.precioUnitario) || 0;
    const iva = Number(item.iva) || 0;
    return total + precio * (1 + iva / 100) * Number(item.cantidad);
  }, 0);

  // Para órdenes viejas sin precios por item, mostrar el precioTotal guardado
  const precioTotal =
    precioTotalCalculado > 0
      ? precioTotalCalculado
      : Number(precioTotalGuardado) || 0;

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
        <Grid item xs={12}>
          <ItemsTable showPrecios />
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              disabled={!proveedorId}
            >
              Agregar Item
            </Button>
          </Box>
          <ItemsModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            proveedorId={proveedorId}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Precio Total"
            value={precioTotal ? getFormattedPrice(precioTotal) : "$0,00"}
            fullWidth
            disabled
            sx={{
              "& .MuiInputBase-root.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            }}
            helperText="Precio Total = Σ (Precio Unitario × (1 + IVA%) × Cantidad)"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default OrdenDeCompraForm;
