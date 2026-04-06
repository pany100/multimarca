"use client";

import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { useFetch } from "@/contexts/FetchContext";
import FormInfoProvider from "@/contexts/FormInfoContext";
import {
  SnackbarProvider,
  useSnackbarContext,
} from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

function AdminStockPageContent({ params }: { params: { id: string } }) {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<any | null>(null);

  const stockId = useMemo(() => Number(params.id), [params.id]);

  const precioVentaCalculado = useMemo(() => {
    const buyPrice =
      stock?.buyPrice === "" || stock?.buyPrice == null
        ? NaN
        : Number(stock.buyPrice);
    const markup =
      stock?.markup === "" || stock?.markup == null
        ? NaN
        : Number(stock.markup);
    if (!Number.isFinite(buyPrice) || buyPrice < 0) return null;
    if (!Number.isFinite(markup)) return null;
    return Math.ceil(buyPrice * (1 + markup / 100) || 0);
  }, [stock?.buyPrice, stock?.markup]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        if (!Number.isFinite(stockId)) {
          setStock(null);
          return;
        }
        const res = await authFetch(`/api/stock/${stockId}`);
        if (!res.ok) {
          setStock(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setStock(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [authFetch, stockId]);

  const buildUpdatePayload = (partial: Record<string, any>) => {
    if (!stock) return partial;
    return {
      id: stock.id,
      name: stock.name,
      brand: stock.brand,
      buyPrice: stock.buyPrice,
      units: stock.units,
      restockValue: stock.restockValue,
      label: stock.label,
      markup: stock.markup,
      proveedorId: stock.proveedorId,
      reportName: stock.reportName,
      sector: stock.sector,
      carBrand: stock.carBrand,
      fraccionable: stock.fraccionable,
      ...partial,
    };
  };

  const handleSavePartial = async (partial: Record<string, any>) => {
    try {
      const res = await authFetch(`/api/stock/${stockId}`, {
        method: "PUT",
        body: JSON.stringify(buildUpdatePayload(partial)),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSnackbar({
          open: true,
          severity: "error",
          message: payload?.error || "Error al guardar el stock",
        });
        return;
      }

      setStock(payload);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Stock actualizado con éxito",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error al realizar la solicitud de actualización",
      });
    }
  };

  const infoGeneralSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required("El nombre es requerido"),
        brand: yup.string().required("La marca es requerida"),
        label: yup.string().required("El rótulo es requerido"),
        sector: yup.string().nullable(),
        carBrand: yup.string().nullable(),
        reportName: yup.string().nullable(),
        fraccionable: yup.boolean().default(false),
      }),
    [],
  );

  const preciosSchema = useMemo(
    () =>
      yup.object({
        buyPrice: yup.number().required("El precio de compra es requerido"),
        markup: yup.number().nullable(),
        restockValue: yup.number().nullable(),
      }),
    [],
  );

  const infoMethods = useForm<any>({
    resolver: yupResolver(infoGeneralSchema),
    defaultValues: {},
  });

  const preciosMethods = useForm<any>({
    resolver: yupResolver(preciosSchema),
    defaultValues: {},
  });

  const onOpenInfo = () => {
    if (!stock) return;
    infoMethods.reset({
      name: stock.name ?? "",
      brand: stock.brand ?? "",
      label: stock.label ?? "",
      sector: stock.sector ?? "",
      carBrand: stock.carBrand ?? "",
      reportName: stock.reportName ?? "",
      fraccionable: Boolean(stock.fraccionable),
    });
  };

  const onOpenPrecios = () => {
    if (!stock) return;
    preciosMethods.reset({
      buyPrice: stock.buyPrice ?? 0,
      markup: stock.markup ?? null,
      restockValue: stock.restockValue ?? null,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : !stock ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No se encontró el stock</Typography>
        </Paper>
      ) : (
        <>
          {/* Header informativo */}
          <Box
            sx={{
              position: "relative",
              backgroundColor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 2,
              mb: 3,
              px: 2,
              transition: "all 0.2s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {stock.name || "Stock"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Rótulo: <b>{stock.label || "-"}</b> · Sector:{" "}
                  <b>{stock.sector || "-"}</b>
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  minWidth: { xs: "100%", sm: 320 },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Precio de venta calculado
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
                  {precioVentaCalculado != null
                    ? getFormattedPrice(precioVentaCalculado)
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <CommonOrderCard
                  title="Información general"
                  formMethods={infoMethods}
                  onOpen={onOpenInfo}
                  onSubmit={async (data) => {
                    await handleSavePartial(data);
                  }}
                  loading={false}
                  maxWidth="sm"
                  formContent={
                    <FormInfoProvider isEditing={true}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <CustomInputText name="name" label="Nombre" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText name="brand" label="Marca" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText name="label" label="Rótulo" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText name="sector" label="Sector" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText
                            name="carBrand"
                            label="Marca de auto"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText
                            name="reportName"
                            label="Nombre de reporte"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomInputBoolean
                            name="fraccionable"
                            label="Fraccionable (Para litros)"
                          />
                        </Grid>
                      </Grid>
                    </FormInfoProvider>
                  }
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nombre
                      </Typography>
                      <Typography>{stock.name || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Marca
                      </Typography>
                      <Typography>{stock.brand || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Rótulo
                      </Typography>
                      <Typography>{stock.label || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Sector
                      </Typography>
                      <Typography>{stock.sector || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Marca de auto
                      </Typography>
                      <Typography>{stock.carBrand || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nombre de reporte
                      </Typography>
                      <Typography>{stock.reportName || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fraccionable
                      </Typography>
                      <Typography>
                        {stock.fraccionable ? "Sí" : "No"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CommonOrderCard>
              </Box>
            </Grid>

            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <CommonOrderCard
                  title="Precios y reposición"
                  formMethods={preciosMethods}
                  onOpen={onOpenPrecios}
                  onSubmit={async (data) => {
                    await handleSavePartial(data);
                  }}
                  loading={false}
                  maxWidth="sm"
                  formContent={
                    <FormInfoProvider isEditing={true}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <CustomInputText
                            name="buyPrice"
                            label="Precio de compra"
                            type="number"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <CustomInputText
                            name="markup"
                            label="Margen"
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
                      </Grid>
                    </FormInfoProvider>
                  }
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Precio de compra
                      </Typography>
                      <Typography>
                        {stock.buyPrice != null
                          ? getFormattedPrice(stock.buyPrice)
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Margen
                      </Typography>
                      <Typography>
                        {stock.markup != null && stock.markup !== ""
                          ? `${Number(stock.markup)}%`
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Valor de reposición
                      </Typography>
                      <Typography>
                        {stock.restockValue != null && stock.restockValue !== ""
                          ? stock.restockValue
                          : "-"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Precio de venta calculado
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {precioVentaCalculado != null
                        ? getFormattedPrice(precioVentaCalculado)
                        : "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      * Calculado como Precio de compra x (1 + Margen/100). Si
                      no hay margen se asume 0%. Se redondea hacia arriba.
                    </Typography>
                  </Box>
                </CommonOrderCard>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default function AdminStockPage({ params }: { params: { id: string } }) {
  return (
    <SnackbarProvider>
      <FormSnackbar />
      <AdminStockPageContent params={params} />
    </SnackbarProvider>
  );
}
