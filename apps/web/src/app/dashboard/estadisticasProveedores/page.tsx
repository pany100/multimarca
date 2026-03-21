"use client";

import DateRangeSearch from "@/components/dates/DateRangeSearch";
import BarGraphic from "@/components/estadisticas/BarGraphic";
import useProveedores from "@/hooks/proveedores/useProveedores";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

function EstadisticasProveedoresPage() {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const theme = useTheme();
  const {
    total,
    proveedores,
    searchProveedores,
    clearProveedores,
    loading,
  } = useProveedores();

  useEffect(() => {
    searchProveedores(null, null);
  }, [searchProveedores]);

  const handleBuscar = () => {
    searchProveedores(from, to);
  };

  const handleLimpiar = () => {
    setFrom(null);
    setTo(null);
    clearProveedores();
  };

  const items = useMemo(
    () =>
      Array.isArray(proveedores)
        ? proveedores.map((p) => ({
            label: p.proveedorNombre || "Proveedor",
            value: p.totalGastado || 0,
          }))
        : [],
    [proveedores]
  );

  const hayDatos = items.length > 0;
  const chartHeight = Math.max(420, items.length * 40);

  const totalGlobal = total.totalGlobal || 0;
  const totalMovimientosPeriodo = total.cantidadTotal || 0;

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "proveedorNombre",
        headerName: "Proveedor",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "totalGastado",
        headerName: "Total comprado",
        flex: 0.55,
        minWidth: 160,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value) => currencyFormatter.format(Number(value || 0)),
      },
      {
        field: "porcentajeDinero",
        headerName: "% del dinero total",
        flex: 0.4,
        minWidth: 120,
        align: "right",
        headerAlign: "right",
        valueGetter: (_value, row) => {
          if (!totalGlobal || totalGlobal <= 0) return "—";
          const pct = (Number(row.totalGastado) / totalGlobal) * 100;
          return `${Number(pct.toFixed(1))}%`;
        },
      },
      {
        field: "cantidadOrdenesCompra",
        headerName: "Órdenes de compra",
        type: "number",
        flex: 0.35,
        minWidth: 130,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "cantidadReparacionesTerceroOrden",
        headerName: "Rep. tercero (órdenes)",
        type: "number",
        flex: 0.38,
        minWidth: 140,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "cantidadReparacionesTerceroVenta",
        headerName: "Rep. tercero (ventas)",
        type: "number",
        flex: 0.38,
        minWidth: 140,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "cantidadTotal",
        headerName: "Total movimientos",
        type: "number",
        flex: 0.32,
        minWidth: 120,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "porcentajeCompras",
        headerName: "% del total de movimientos",
        flex: 0.42,
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        valueGetter: (_value, row) => {
          if (!totalMovimientosPeriodo || totalMovimientosPeriodo <= 0)
            return "—";
          const pct =
            (Number(row.cantidadTotal) / totalMovimientosPeriodo) * 100;
          return `${Number(pct.toFixed(1))}%`;
        },
      },
    ],
    [totalGlobal, totalMovimientosPeriodo]
  );

  const rows = useMemo(
    () =>
      Array.isArray(proveedores)
        ? proveedores.map((p, idx) => ({
            id: p.proveedorId > 0 ? p.proveedorId : `row-${idx}`,
            proveedorNombre: p.proveedorNombre,
            totalGastado: p.totalGastado,
            cantidadOrdenesCompra: p.cantidadOrdenesCompra,
            cantidadReparacionesTerceroOrden:
              p.cantidadReparacionesTerceroOrden,
            cantidadReparacionesTerceroVenta:
              p.cantidadReparacionesTerceroVenta,
            cantidadTotal: p.cantidadTotal,
          }))
        : [],
    [proveedores]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          Estadísticas de Proveedores
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={12} md={12}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <DateRangeSearch
                  setFrom={setFrom}
                  setTo={setTo}
                  fromValue={from}
                  toValue={to}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBuscar}
                  startIcon={<SearchIcon />}
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    height: "40px",
                    backgroundColor: (t) => t.palette.primary.main,
                    "&:hover": {
                      backgroundColor: (t) => t.palette.primary.dark,
                    },
                  }}
                >
                  Buscar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLimpiar}
                  startIcon={<ClearIcon />}
                  sx={{ minWidth: "auto", px: 2, height: "40px" }}
                >
                  Limpiar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 0.5,
          }}
        >
          {loading ? (
            <>
              <Skeleton variant="text" width={320} height={28} />
              <Skeleton variant="text" width={220} height={22} />
            </>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Total comprado en el período:{" "}
                {currencyFormatter.format(total.totalGlobal || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Órdenes de compra: {total.cantidadOrdenesCompra || 0} · Rep.
                tercero en órdenes:{" "}
                {total.cantidadReparacionesTerceroOrden || 0} · Rep. tercero en
                ventas: {total.cantidadReparacionesTerceroVenta || 0} · Total
                movimientos: {total.cantidadTotal || 0}
              </Typography>
            </>
          )}
        </Box>
      </Box>
      <Paper elevation={0} sx={{ borderRadius: 2, p: 2 }}>
        {hayDatos || loading ? (
          <BarGraphic
            data={items}
            title="Total comprado por proveedor"
            currency="ARS"
            height={chartHeight}
            maxWidth="100%"
            loading={loading}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <Typography color="text.secondary">
              Sin datos disponibles
            </Typography>
          </Box>
        )}
      </Paper>
      <Paper elevation={0} sx={{ borderRadius: 2, p: 2, mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Detalle por proveedor
        </Typography>
        <div style={{ width: "100%" }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      </Paper>
    </Box>
  );
}

export default EstadisticasProveedoresPage;
