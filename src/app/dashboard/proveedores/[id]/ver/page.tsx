"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useCallback, useEffect, useState } from "react";

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
  const { authFetch } = useFetch();

  // Handlers para los cambios de fecha
  const handleFromDateChange = (
    value: Date | null | any,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setFromDate(dateValue);
  };

  const handleToDateChange = (
    value: Date | null | any,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setToDate(dateValue);
  };

  const columns: GridColDef[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Deuda" ? "error" : "success"}
          size="small"
        />
      ),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 3,
      renderCell: (params) => (
        <Box
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.2",
            py: 1,
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
      flex: 1,
      renderCell: (params) =>
        `$${params.value.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];

  const obtenerDatos = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL(
        `/api/proveedores/${params.id}`,
        window.location.origin
      );
      url.searchParams.append("page", (page + 1).toString());
      url.searchParams.append("pageSize", pageSize.toString());

      // Agregar parámetros de fecha si están definidos
      if (fromDate) {
        const formattedFromDate = fromDate.toISOString().split("T")[0];
        url.searchParams.append("from", formattedFromDate);
      }

      if (toDate) {
        const formattedToDate = toDate.toISOString().split("T")[0];
        url.searchParams.append("to", formattedToDate);
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
  }, [authFetch, params.id, page, pageSize, fromDate, toDate]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {nombreProveedor && (
        <>
          <Typography variant="h5" gutterBottom>
            Estado de cuenta de: {nombreProveedor}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {estadoDeuda > 0 ? "Crédito: " : "Deuda: "}
            {estadoDeuda && getFormattedPrice(estadoDeuda)}
          </Typography>
        </>
      )}

      <Box
        sx={{
          mb: 3,
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

      <DataGrid
        rows={datos}
        columns={columns}
        loading={cargando}
        rowCount={totalRows}
        pageSizeOptions={[5, 10, 25]}
        paginationMode="server"
        paginationModel={{
          page,
          pageSize,
        }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.fecha + row.tipo + row.monto}
        autoHeight
      />
    </Box>
  );
}

export default VerPage;
