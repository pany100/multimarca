"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TipoOperacion {
  id: number;
  label: string;
  esIngreso: boolean;
  esGasto: boolean;
}

interface ResumenTransaccionesTableProps {
  refreshTrigger?: number;
  setRefreshTrigger?: React.Dispatch<React.SetStateAction<number>>;
}

function ResumenTransaccionesTable({
  refreshTrigger = 0,
  setRefreshTrigger,
}: ResumenTransaccionesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authFetch } = useFetch();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tiposOperacion, setTiposOperacion] = useState<TipoOperacion[]>([]);
  const [selectedTipoOperacion, setSelectedTipoOperacion] = useState<
    string | null
  >(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const getViewLink = (params: any) => {
    const { tipo, id } = params.row;

    switch (tipo) {
      case "Gasto":
        return `/dashboard/gastos/${id}/ver`;
      case "Extraccion":
        return `/dashboard/extracciones/${id}/ver`;
      case "IngresoPorVenta":
        return `/dashboard/ingresos-ventas/${id}/ver`;
      case "IngresoPorReparacion":
        return `/dashboard/ingresos-reparacion/${id}/ver`;
      case "IngresoManualDeDinero":
        return `/dashboard/ingresos-manuales/${id}/ver`;
      default:
        return "#";
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString("es-AR");
      },
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params) => {
        let color = "default";
        let label = params.value;

        switch (params.value) {
          case "Gasto":
            color = "error";
            break;
          case "Extraccion":
            color = "warning";
            break;
          case "IngresoPorVenta":
            color = "success";
            label = "Ingreso por Venta";
            break;
          case "IngresoPorReparacion":
            color = "success";
            label = "Ingreso por Reparación";
            break;
          case "IngresoManualDeDinero":
            color = "info";
            label = "Ingreso Manual";
            break;
        }

        return <Chip label={label} color={color as any} size="small" />;
      },
    },
    {
      field: "tipoOperacion",
      headerName: "Operación",
      flex: 1,
      valueGetter: (value: any) => value?.label || "N/A",
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueFormatter: (value) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "detalleEntidad",
      headerName: "Entidad",
      flex: 1.5,
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1.5,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Link href={getViewLink(params)}>
          <VisibilityIcon color="primary" />
        </Link>
      ),
    },
  ];

  const fetchTiposOperacion = useCallback(async () => {
    try {
      const response = await authFetch("/api/tipo-operacion");
      const data = await response.json();
      if (data) {
        setTiposOperacion(data);
      }
    } catch (error) {
      console.error("Error al cargar tipos de operación:", error);
    }
  }, [authFetch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("size", pageSize.toString());

      if (searchQuery) {
        params.set("query", searchQuery);
      }

      if (selectedTipoOperacion) {
        params.set("tipoOperacionId", selectedTipoOperacion);
      }

      if (startDate) {
        params.set("startDate", startDate.toISOString());
      }

      if (endDate) {
        params.set("endDate", endDate.toISOString());
      }

      const response = await authFetch(
        `/api/resumen-transacciones?${params.toString()}`
      );
      const data = await response.json();
      if (data) {
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [
    authFetch,
    page,
    pageSize,
    searchQuery,
    selectedTipoOperacion,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchTiposOperacion();
  }, [fetchTiposOperacion]);

  useEffect(() => {
    // Check URL parameters
    const pageParam = searchParams.get("page");
    const queryParam = searchParams.get("query");
    const tipoOperacionIdParam = searchParams.get("tipoOperacionId");

    if (pageParam) {
      setPage(parseInt(pageParam));
    }

    if (queryParam) {
      setSearchQuery(queryParam);
    }

    if (tipoOperacionIdParam) {
      setSelectedTipoOperacion(tipoOperacionIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleSearch = () => {
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");

    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }

    router.push(`?${params.toString()}`);
  };

  const handleTipoOperacionChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as string;
    setSelectedTipoOperacion(value === "all" ? null : value);
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");

    if (value !== "all") {
      params.set("tipoOperacionId", value);
    } else {
      params.delete("tipoOperacionId");
    }

    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTipoOperacion(null);
    setStartDate(null);
    setEndDate(null);
    setPage(0);

    router.push("/dashboard/resumen-transacciones");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    params.set("size", newPageSize.toString());

    router.push(`?${params.toString()}`);
  };

  const handleDateChange = () => {
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");

    if (startDate) {
      params.set("startDate", startDate.toISOString());
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate.toISOString());
    } else {
      params.delete("endDate");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Resumen de Transacciones
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="tipo-operacion-filter-label">
              Tipo de Operación
            </InputLabel>
            <Select
              labelId="tipo-operacion-filter-label"
              id="tipo-operacion-filter"
              value={selectedTipoOperacion || "all"}
              label="Tipo de Operación"
              onChange={handleTipoOperacionChange as any}
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              {tiposOperacion.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Desde"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
              }}
              slotProps={{ textField: { size: "small" } }}
            />

            <DatePicker
              label="Hasta"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue);
              }}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            onClick={handleDateChange}
            sx={{ minWidth: 100 }}
          >
            Filtrar
          </Button>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ minWidth: 100 }}
          >
            Limpiar
          </Button>
        </Stack>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          rowCount={total}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            handlePageChange(model.page);
            handlePageSizeChange(model.pageSize);
          }}
          disableRowSelectionOnClick
          getRowId={(row) => `${row.tipo}-${row.id}`}
        />
      </Box>
    </Paper>
  );
}

export default ResumenTransaccionesTable;
