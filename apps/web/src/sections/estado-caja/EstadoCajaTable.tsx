"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  getFormattedPrice,
  getFormattedPriceDolar,
} from "@/utils/fieldHelper";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useCallback, useEffect, useState } from "react";

export interface EstadoCajaRow {
  tipoOperacionId: number;
  label: string;
  cantidadIngresos: number;
  totalIngresos: number;
  cantidadEgresos: number;
  totalEgresos: number;
  saldo: number;
}

interface EstadoCajaResponse {
  items: EstadoCajaRow[];
  moneda: string;
  from: string | null;
  to: string | null;
}

function EstadoCajaTable() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<EstadoCajaRow[]>([]);
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchEstadoCaja = useCallback(
    async (m: "ARS" | "USD", f: Date | null, t: Date | null) => {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({ moneda: m });
        if (f) params.set("from", f.toISOString().split("T")[0]);
        if (t) params.set("to", t.toISOString().split("T")[0]);
        const res = await authFetch(`/api/estado-caja?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Error al cargar estado de caja");
        }
        const json: EstadoCajaResponse = await res.json();
        setData(json.items ?? []);
      } catch (e) {
        setData([]);
        setError(
          e instanceof Error ? e.message : "Error al cargar estado de caja"
        );
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const handleBuscar = () => {
    fetchEstadoCaja(moneda, fromDate, toDate);
  };

  useEffect(() => {
    fetchEstadoCaja("ARS", null, null);
  }, [fetchEstadoCaja]);

  const handleLimpiar = () => {
    setFromDate(null);
    setToDate(null);
    setMoneda("ARS");
    setData([]);
    setError(null);
    setHasSearched(false);
  };

  const formatPrice = (value: number) =>
    moneda === "USD" ? getFormattedPriceDolar(value) : getFormattedPrice(value);

  const totalIngresos = data.reduce((s, r) => s + Number(r.totalIngresos), 0);
  const totalEgresos = data.reduce((s, r) => s + Number(r.totalEgresos), 0);
  const saldoGeneral = data.reduce((s, r) => s + Number(r.saldo), 0);

  const rows = [...data];
  if (data.length > 0) {
    rows.push({
      tipoOperacionId: -1,
      label: "Total",
      cantidadIngresos: 0,
      totalIngresos: totalIngresos,
      cantidadEgresos: 0,
      totalEgresos: totalEgresos,
      saldo: saldoGeneral,
    });
  }

  const columns: GridColDef[] = [
    {
      field: "label",
      headerName: "Medio de pago",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "cantidadIngresos",
      headerName: "Cant. ingresos",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "totalIngresos",
      headerName: "Total ingresos",
      flex: 1,
      minWidth: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => formatPrice(value ?? 0),
    },
    {
      field: "cantidadEgresos",
      headerName: "Cant. egresos",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "totalEgresos",
      headerName: "Total egresos",
      flex: 1,
      minWidth: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => formatPrice(value ?? 0),
    },
    {
      field: "saldo",
      headerName: "Saldo",
      flex: 1,
      minWidth: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => formatPrice(value ?? 0),
      renderCell: (params) => {
        const val = Number(params.value ?? 0);
        const isTotal = params.row.tipoOperacionId === -1;
        return (
          <Typography
            sx={{
              fontWeight: isTotal ? 600 : 500,
              color: val >= 0 ? "success.main" : "error.main",
            }}
          >
            {formatPrice(val)}
          </Typography>
        );
      },
    },
  ];

  const handleFromDateChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) return;
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setFromDate(dateValue);
  };

  const handleToDateChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) return;
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setToDate(dateValue);
  };

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flexWrap: "wrap" }}
          >
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            >
              <InputLabel id="estado-caja-moneda">Moneda</InputLabel>
              <Select
                labelId="estado-caja-moneda"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as "ARS" | "USD")}
                label="Moneda"
              >
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={fromDate}
                onChange={handleFromDateChange}
                format="dd-MM-yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                      },
                    },
                  },
                }}
              />
              <DatePicker
                label="Hasta"
                value={toDate}
                onChange={handleToDateChange}
                format="dd-MM-yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              size="small"
              onClick={handleBuscar}
              startIcon={<SearchIcon />}
              sx={{
                minWidth: "auto",
                px: 2,
                height: "40px",
                backgroundColor: (theme) => theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
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
              sx={{
                minWidth: "auto",
                px: 2,
                height: "40px",
              }}
            >
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!hasSearched ? (
        <Typography color="text.secondary">
          Seleccione los filtros y haga clic en Buscar para ver el estado de
          caja.
        </Typography>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) =>
            row.tipoOperacionId === -1 ? "total" : String(row.tipoOperacionId)
          }
          getRowClassName={(params) =>
            params.id === "total" ? "fila-total" : ""
          }
          getRowHeight={() => "auto"}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            border: 1,
            borderColor: "divider",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: (theme) => theme.palette.primary.main,
              fontSize: "0.875rem",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              minHeight: "50px",
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-row": {
              minHeight: "50px !important",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
            "& .MuiDataGrid-row.fila-total": {
              backgroundColor: "action.selected",
              fontWeight: 600,
            },
          }}
        />
      )}
    </Box>
  );
}

export default EstadoCajaTable;
