import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import * as yup from "yup";

/** Mismo criterio que al elegir repuesto en RepuestosModal (precio unitario de venta). */
function precioVentaCalculadoDesdeCompraYMarkup(
  buyPrice: unknown,
  markup: unknown
): number | null {
  const b =
    buyPrice === "" || buyPrice == null ? NaN : Number(buyPrice);
  const m =
    markup === "" || markup == null ? 0 : Number(markup);
  if (!Number.isFinite(b) || b < 0) return null;
  if (!Number.isFinite(m)) return null;
  return Math.ceil(b * (1 + m / 100) || 0);
}

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  brand: yup.string().required("La marca es requerida"),
  buyPrice: yup.number().nullable(),
  restockValue: yup.number().nullable(),
  label: yup.string().nullable(),
  markup: yup.number().nullable(),
  proveedorId: yup.number().required("El proveedor es requerido"),
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
  const precioVentaInformado = useMemo(
    () => precioVentaCalculadoDesdeCompraYMarkup(buyPrice, markup),
    [buyPrice, markup]
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <CustomInputBoolean
              name="fraccionable"
              label="Fraccionable (Para litros)"
            />
            <Typography variant="body2" color="text.secondary">
              Precio venta calculado:{" "}
              {precioVentaInformado != null
                ? getFormattedPrice(precioVentaInformado)
                : "—"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default StockForm;
