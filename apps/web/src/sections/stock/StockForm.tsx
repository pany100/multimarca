import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularPrecioNeto, calcularPrecioVenta } from "@/utils/stock-pricing";
import { Box, Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  label: yup.string().required("El rótulo es requerido"),
  proveedorId: yup.number().required("El proveedor es requerido"),
  brand: yup.string().nullable(),
  buyPrice: yup.number().nullable(),
  restockValue: yup.number().nullable(),
  markup: yup.number().nullable(),
  buyIva: yup.number().nullable(),
  sellIva: yup.number().nullable(),
  reportName: yup.string().nullable(),
  sector: yup.string().nullable(),
  carBrand: yup.string().nullable(),
  fraccionable: yup.boolean().default(false),
});

export const unitsSchema = yup.object({
  units: yup.number().required("Las unidades son requeridas"),
  name: yup.string().required("El nombre es requerido"),
  brand: yup.string().required("La marca es requerida"),
  buyPrice: yup.number().nullable(),
  restockValue: yup.number().nullable(),
  label: yup.string().nullable(),
  markup: yup.number().nullable(),
  buyIva: yup.number().nullable(),
  sellIva: yup.number().nullable(),
  proveedorId: yup.number().required("El proveedor es requerido"),
  reportName: yup.string().nullable(),
  sector: yup.string().nullable(),
  carBrand: yup.string().nullable(),
  fraccionable: yup.boolean().default(false),
});

const StockForm = () => {
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const buyPrice = useWatch({ name: "buyPrice" });
  const markup = useWatch({ name: "markup" });
  const sellIva = useWatch({ name: "sellIva" });

  const precioNeto = useMemo(
    () => calcularPrecioNeto(buyPrice, markup),
    [buyPrice, markup]
  );

  const precioVentaFinal = useMemo(
    () => calcularPrecioVenta(buyPrice, markup, sellIva),
    [buyPrice, markup, sellIva]
  );

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
        <Grid item xs={12} md={4}>
          <CustomInputText name="markup" label="Margen (%)" type="number" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="buyIva"
            label="IVA de compra (%)"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="sellIva"
            label="IVA de venta (%)"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomAutocomplete
            name="proveedorId"
            label="Proveedor"
            searchOptions={searchProveedores}
            initialOptions={initialProveedor}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="reportName" label="Nombre de Reporte" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="sector" label="Sector" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="carBrand" label="Marca de Auto" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputBoolean
            name="fraccionable"
            label="Fraccionable (Para litros)"
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" component="div">
              Paso 1: Precio neto = Precio de compra x (1 + Margen/100)
              {precioNeto != null && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ fontWeight: 700, ml: 1 }}
                >
                  {getFormattedPrice(precioNeto)}
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              Paso 2: Precio de venta = Precio neto x (1 + IVA venta/100)
              {precioVentaFinal != null && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ fontWeight: 700, ml: 1 }}
                >
                  {getFormattedPrice(precioVentaFinal)}
                </Typography>
              )}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ mt: 0.5, fontStyle: "italic" }}
            >
              Los precios se redondean al entero más cercano.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default StockForm;
