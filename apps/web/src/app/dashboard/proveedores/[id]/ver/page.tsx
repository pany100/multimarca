"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useCallback, useEffect, useState } from "react";

const OPERACION_STYLES: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  "Orden de Compra": { label: "Orden de Compra", bg: "#FFF3CD", color: "#7A5200" },
  "Rep. Tercero Orden": { label: "Rep. Tercero Orden", bg: "#FCE4EC", color: "#B71C1C" },
  "Rep. Tercero Venta": { label: "Rep. Tercero Venta", bg: "#EDE7F6", color: "#4527A0" },
  "Pago a Proveedor": { label: "Pago a Proveedor", bg: "#E8F5E9", color: "#1B5E20" },
};

type Origen = {
  rowId: string;
  descripcion: string;
  fecha: string;
  // saldoHastaAqui justo ANTES de esta fila (para offset del cálculo)
  offset: number;
};

function VerPage({ params }: { params: { id: string } }) {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [estadoDeuda, setEstadoDeuda] = useState(0);
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [appliedFromDate, setAppliedFromDate] = useState<Date | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<Date | null>(null);
  const [origen, setOrigen] = useState<Origen | null>(null);
  const { authFetch } = useFetch();

  const handleFromDateChange = (
    value: Date | null | any,
    context: PickerChangeHandlerContext<DateValidationError>,
  ) => {
    if (context.validationError) return;
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setFromDate(dateValue);
  };

  const handleToDateChange = (
    value: Date | null | any,
    context: PickerChangeHandlerContext<DateValidationError>,
  ) => {
    if (context.validationError) return;
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setToDate(dateValue);
  };

  const handleSetOrigen = (row: any) => {
    if (origen?.rowId === row.rowId) {
      setOrigen(null);
      return;
    }
    // El offset es el saldo ANTES de esta fila: saldoHastaAqui - contribución propia
    const contribucion = row.tipo === "Pago" ? row.monto : -row.monto;
    const offset = row.saldoHastaAqui - contribucion;
    setOrigen({
      rowId: row.rowId,
      descripcion: row.descripcion,
      fecha: new Date(row.fecha).toLocaleDateString(),
      offset,
    });
  };

  const calcularSaldoRelativo = (row: any): number | null => {
    if (!origen) return row.saldoHastaAqui;
    // Filas más antiguas que el origen (saldoHastaAqui <= offset) → no mostrar
    if (row.saldoHastaAqui <= origen.offset && row.rowId !== origen.rowId) {
      return null;
    }
    return row.saldoHastaAqui - origen.offset;
  };

  const columns: GridColDef[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.9,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {new Date(params.value).toLocaleDateString()}
        </Box>
      ),
    },
    {
      field: "operacion",
      headerName: "Operación",
      flex: 1.5,
      renderCell: (params) => {
        const style = OPERACION_STYLES[params.value] ?? {
          label: params.value,
          bg: "#F5F5F5",
          color: "#333",
        };
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              label={style.label}
              size="small"
              sx={{
                bgcolor: style.bg,
                color: style.color,
                fontWeight: 600,
                fontSize: "0.72rem",
                border: `1px solid ${style.color}33`,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 3,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.3",
            py: 0.5,
          }}
        >
          <a href={params.row.ref} style={{ textDecoration: "underline" }}>
            {params.value}
          </a>
        </Box>
      ),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1.1,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const esPago = params.row.tipo === "Pago";
        const signo = esPago ? "+" : "-";
        const color = esPago ? "#1B5E20" : "#B71C1C";
        const monto = params.value.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "100%",
              width: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.2px",
              }}
            >
              {signo}${monto}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "saldoHastaAqui",
      headerName: "Saldo",
      flex: 1.1,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const saldo = calcularSaldoRelativo(params.row);
        if (saldo === null) {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                width: "100%",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
                —
              </Typography>
            </Box>
          );
        }
        const positivo = saldo >= 0;
        const color = positivo ? "#1B5E20" : "#B71C1C";
        const signo = positivo ? "+" : "-";
        const montoStr = Math.abs(saldo).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "100%",
              width: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.2px",
                opacity: 0.85,
              }}
            >
              {signo}${montoStr}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "_origen",
      headerName: "",
      width: 40,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const esOrigen = origen?.rowId === params.row.rowId;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Tooltip
              title={esOrigen ? "Quitar punto de inicio" : "Calcular saldo desde aquí"}
              placement="right"
            >
              <IconButton
                size="small"
                onClick={() => handleSetOrigen(params.row)}
                sx={{ color: esOrigen ? "#F57C00" : "text.disabled", p: 0.5 }}
              >
                {esOrigen ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const obtenerDatos = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL(
        `/api/proveedores/${params.id}`,
        window.location.origin,
      );
      url.searchParams.append("page", (page + 1).toString());
      url.searchParams.append("pageSize", pageSize.toString());

      if (appliedFromDate) {
        url.searchParams.append("from", appliedFromDate.toISOString().split("T")[0]);
      }
      if (appliedToDate) {
        url.searchParams.append("to", appliedToDate.toISOString().split("T")[0]);
      }

      const respuesta = await authFetch(url.toString());
      const data = await respuesta.json();

      setDatos(data.items);
      setTotalRows(data.total);
      setEstadoDeuda(data.saldoTotal);
      setNombreProveedor(data.nombreProveedor);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setCargando(false);
    }
  }, [authFetch, params.id, page, pageSize, appliedFromDate, appliedToDate]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // Resetear origen al cambiar de página o filtros
  useEffect(() => {
    setOrigen(null);
  }, [page, appliedFromDate, appliedToDate]);

  const handleBuscar = () => {
    setPage(0);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setAppliedFromDate(null);
    setAppliedToDate(null);
  };

  const saldoPositivo = estadoDeuda >= 0;

  // Saldo desde el origen (última fila visible en datos, que es la más reciente de la página)
  const saldoDesdeOrigen =
    origen && datos.length > 0
      ? datos[0].saldoHastaAqui - origen.offset
      : null;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {nombreProveedor && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Estado de cuenta de: {nombreProveedor}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Saldo en el período:
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: saldoPositivo ? "#1B5E20" : "#B71C1C",
              }}
            >
              {saldoPositivo ? "+" : "-"}
              {getFormattedPrice(Math.abs(estadoDeuda))}
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">Filtrar por fecha:</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker
              label="Desde"
              value={fromDate}
              onChange={handleFromDateChange}
              format="dd-MM-yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 150 },
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
                  sx: { width: 150 },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleBuscar}
              size="medium"
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="medium"
            >
              Limpiar
            </Button>
          </Stack>
        </LocalizationProvider>
      </Box>

      {origen && saldoDesdeOrigen !== null && (
        <Alert
          severity="info"
          icon={<BookmarkIcon fontSize="inherit" sx={{ color: "#F57C00" }} />}
          onClose={() => setOrigen(null)}
          sx={{ mb: 2, alignItems: "center" }}
          action={
            <Button color="inherit" size="small" onClick={() => setOrigen(null)}>
              Quitar
            </Button>
          }
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="body2">
              Saldo desde <strong>{origen.fecha}</strong> — {origen.descripcion}:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: saldoDesdeOrigen >= 0 ? "#1B5E20" : "#B71C1C",
              }}
            >
              {saldoDesdeOrigen >= 0 ? "+" : "-"}$
              {Math.abs(saldoDesdeOrigen).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            {page > 0 && (
              <Typography variant="caption" color="text.secondary">
                (calculado sobre esta página)
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <DataGrid
        rows={datos}
        columns={columns}
        loading={cargando}
        rowCount={totalRows}
        pageSizeOptions={[5, 10, 25]}
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.rowId}
        getRowClassName={(params) =>
          origen?.rowId === params.row.rowId ? "origen-row" : ""
        }
        sx={{
          "& .MuiDataGrid-cell": { alignItems: "center" },
          "& .origen-row": {
            borderLeft: "3px solid #F57C00",
            bgcolor: "#FFF8F0",
          },
        }}
      />
    </Box>
  );
}

export default VerPage;
