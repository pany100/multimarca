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
import { calcularPrecioNeto, calcularPrecioVenta } from "@/utils/stock-pricing";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PercentIcon from "@mui/icons-material/Percent";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

/** Small helper: label + value with optional icon */
function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
        {icon && (
          <Box sx={{ color: "text.disabled", display: "flex", fontSize: 16 }}>
            {icon}
          </Box>
        )}
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography>{value || "-"}</Typography>
    </Box>
  );
}

function AdminStockPageContent({ params }: { params: { id: string } }) {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<any | null>(null);

  const stockId = useMemo(() => Number(params.id), [params.id]);

  const precioNeto = useMemo(
    () => calcularPrecioNeto(stock?.buyPrice, stock?.markup),
    [stock?.buyPrice, stock?.markup]
  );

  const precioVentaCalculado = useMemo(
    () => calcularPrecioVenta(stock?.buyPrice, stock?.markup, stock?.sellIva),
    [stock?.buyPrice, stock?.markup, stock?.sellIva]
  );

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
      buyIva: stock.buyIva,
      sellIva: stock.sellIva,
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
        buyIva: yup.number().nullable(),
        sellIva: yup.number().nullable(),
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
      buyIva: stock.buyIva ?? null,
      sellIva: stock.sellIva ?? null,
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InventoryIcon sx={{ color: "primary.main", fontSize: 28 }} />
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
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, ml: 4.5 }}
                >
                  Rótulo: <b>{stock.label || "-"}</b> · Sector:{" "}
                  <b>{stock.sector || "-"}</b>
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "success.light",
                  backgroundColor: "success.50",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.success.main}08, ${theme.palette.success.main}15)`,
                  minWidth: { xs: "100%", sm: 320 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <StorefrontIcon
                    sx={{ color: "success.main", fontSize: 18 }}
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    Precio de venta calculado
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, mt: 0.25, color: "success.dark" }}
                >
                  {precioVentaCalculado != null
                    ? getFormattedPrice(precioVentaCalculado)
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            {/* ───── Información general ───── */}
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
                      <InfoField
                        icon={<InventoryIcon sx={{ fontSize: 16 }} />}
                        label="Nombre"
                        value={stock.name}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                        label="Marca"
                        value={stock.brand}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                        label="Rótulo"
                        value={stock.label}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                        label="Sector"
                        value={stock.sector}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<DirectionsCarIcon sx={{ fontSize: 16 }} />}
                        label="Marca de auto"
                        value={stock.carBrand}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        label="Nombre de reporte"
                        value={stock.reportName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoField
                        label="Fraccionable"
                        value={
                          <Chip
                            label={stock.fraccionable ? "Sí" : "No"}
                            size="small"
                            color={stock.fraccionable ? "info" : "default"}
                            variant="outlined"
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                </CommonOrderCard>
              </Box>
            </Grid>

            {/* ───── Precios y reposición ───── */}
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
                            label="Margen (%)"
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
                        <Grid item xs={12} md={6}>
                          <CustomInputText
                            name="buyIva"
                            label="IVA de compra (%)"
                            type="number"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomInputText
                            name="sellIva"
                            label="IVA de venta (%)"
                            type="number"
                          />
                        </Grid>
                      </Grid>
                    </FormInfoProvider>
                  }
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <InfoField
                        icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
                        label="Precio de compra"
                        value={
                          stock.buyPrice != null
                            ? getFormattedPrice(stock.buyPrice)
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <InfoField
                        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                        label="Margen"
                        value={
                          stock.markup != null && stock.markup !== ""
                            ? `${Number(stock.markup)}%`
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <InfoField
                        icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                        label="Valor de reposición"
                        value={
                          stock.restockValue != null &&
                          stock.restockValue !== ""
                            ? stock.restockValue
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<PercentIcon sx={{ fontSize: 16 }} />}
                        label="IVA de compra"
                        value={
                          stock.buyIva != null && stock.buyIva !== ""
                            ? `${Number(stock.buyIva)}%`
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<PercentIcon sx={{ fontSize: 16 }} />}
                        label="IVA de venta"
                        value={
                          stock.sellIva != null && stock.sellIva !== ""
                            ? `${Number(stock.sellIva)}%`
                            : undefined
                        }
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Precio de venta destacado */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                      mb: 2,
                      p: 1.5,
                      borderRadius: 1,
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.success.main}08, ${theme.palette.success.main}15)`,
                      border: "1px solid",
                      borderColor: "success.light",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <StorefrontIcon
                        sx={{ color: "success.main", fontSize: 20 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Precio de venta calculado
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "success.dark" }}
                    >
                      {precioVentaCalculado != null
                        ? getFormattedPrice(precioVentaCalculado)
                        : "-"}
                    </Typography>
                  </Box>

                  {/* Desglose: fórmula + ejemplo numérico */}
                  <Box
                    sx={{
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <CalculateOutlinedIcon
                        sx={{ color: "info.main", fontSize: 18 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Cómo se calcula
                      </Typography>
                    </Box>

                    {/* Paso 1: Precio neto */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Precio neto = Precio de compra x (1 + Margen / 100),
                        redondeado al entero más cercano
                      </Typography>
                      {stock.buyPrice != null && precioNeto != null && (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ fontWeight: 800 }}
                          >
                            {getFormattedPrice(precioNeto)}
                          </Typography>
                          {` = ${getFormattedPrice(stock.buyPrice)} x (1 + ${Number(stock.markup ?? 0)} / 100)`}
                        </Typography>
                      )}
                    </Box>

                    {/* Paso 2: Precio de venta */}
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Precio de venta = Precio neto x (1 + IVA venta / 100),
                        redondeado al entero más cercano
                      </Typography>
                      {precioNeto != null && precioVentaCalculado != null && (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ fontWeight: 800 }}
                          >
                            {getFormattedPrice(precioVentaCalculado)}
                          </Typography>
                          {` = ${getFormattedPrice(precioNeto)} x (1 + ${Number(stock.sellIva ?? 0)} / 100)`}
                        </Typography>
                      )}
                    </Box>

                    {/* Ganancia IVA (solo si hay buyIva) */}
                    {stock.buyIva != null &&
                      Number(stock.buyIva) > 0 &&
                      (() => {
                        const buyPriceNum = Number(stock.buyPrice ?? 0);
                        const markupNum = Number(stock.markup ?? 0);
                        const buyIvaNum = Number(stock.buyIva);
                        const sellIvaNum = Number(stock.sellIva ?? 0);
                        const precioNetoNum =
                          buyPriceNum * (1 + markupNum / 100);
                        const ivaCompra = buyPriceNum * (buyIvaNum / 100);
                        const ivaVenta = precioNetoNum * (sellIvaNum / 100);
                        const ganancia = ivaVenta - ivaCompra;

                        return (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mb: 0.5,
                                }}
                              >
                                <TrendingUpIcon
                                  sx={{
                                    color: "warning.main",
                                    fontSize: 16,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  Ganancia por IVA (informativo)
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                IVA compra = Precio de compra x IVA compra / 100
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {getFormattedPrice(ivaCompra)} ={" "}
                                {getFormattedPrice(buyPriceNum)} x {buyIvaNum} /
                                100
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                IVA venta = Precio neto x IVA venta / 100
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {getFormattedPrice(ivaVenta)} ={" "}
                                {getFormattedPrice(precioNetoNum)} x{" "}
                                {sellIvaNum} / 100
                              </Typography>

                              <Box
                                sx={{
                                  mt: 1,
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor:
                                    ganancia >= 0
                                      ? "success.main"
                                      : "error.main",
                                  background: (theme) =>
                                    `linear-gradient(135deg, ${ganancia >= 0 ? theme.palette.success.main : theme.palette.error.main}10, ${ganancia >= 0 ? theme.palette.success.main : theme.palette.error.main}20)`,
                                  border: "1px solid",
                                  borderColor:
                                    ganancia >= 0
                                      ? "success.light"
                                      : "error.light",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Ganancia = {getFormattedPrice(ivaVenta)} -{" "}
                                  {getFormattedPrice(ivaCompra)} ={" "}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      fontWeight: 800,
                                      color:
                                        ganancia >= 0
                                          ? "success.dark"
                                          : "error.dark",
                                    }}
                                  >
                                    {getFormattedPrice(ganancia)}
                                  </Typography>
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        );
                      })()}
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
