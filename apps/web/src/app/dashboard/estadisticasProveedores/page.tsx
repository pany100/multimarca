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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "proveedorNombre",
        headerName: "Proveedor",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "totalGastado",
        headerName: "Total comprado",
        flex: 0.6,
        minWidth: 180,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value) => currencyFormatter.format(Number(value || 0)),
      },
      {
        field: "cantidadGastos",
        headerName: "Cant. compras",
        type: "number",
        flex: 0.3,
        minWidth: 120,
        align: "right",
        headerAlign: "right",
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      Array.isArray(proveedores)
        ? proveedores.map((p, idx) => ({
            id: idx,
            proveedorNombre: p.proveedorNombre,
            totalGastado: p.totalGastado,
            cantidadGastos: p.cantidadGastos,
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
                Compras registradas: {total.cantidadGastos || 0}
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
