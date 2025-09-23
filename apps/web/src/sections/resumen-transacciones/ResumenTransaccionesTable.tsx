"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TipoOperacion {
  id: number;
  label: string;
  esIngreso: boolean;
  esGasto: boolean;
}

function ResumenTransaccionesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authFetch } = useFetch();

  const [tiposOperacion, setTiposOperacion] = useState<TipoOperacion[]>([]);
  const [selectedTipoOperacion, setSelectedTipoOperacion] = useState<
    string | null
  >(null);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) => {
        return value ? new Date(value).toLocaleDateString("es-AR") : "";
      },
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params: any) => {
        let color = "default";
        let label = params.row.tipo;

        switch (params.row.tipo) {
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
      renderCell: (params: any) => {
        const label = params.row.tipoOperacion || "N/A";
        // Determine color based on operation type
        let color = "default";

        // Common operation types and their colors
        if (label.toLowerCase().includes("efectivo")) color = "primary";
        else if (label.toLowerCase().includes("transferencia")) color = "info";
        else if (label.toLowerCase().includes("cheque")) color = "secondary";
        else if (label.toLowerCase().includes("tarjeta")) color = "success";
        else if (label.toLowerCase().includes("mercado")) color = "warning";

        return <Chip label={label} color={color as any} size="small" />;
      },
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueFormatter: (value: number) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.7,
      renderCell: (params: any) => (
        <Chip
          label={params.row.moneda}
          color={params.row.moneda === "Dolar" ? "success" : "warning"}
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
      field: "Ver",
      headerName: "Ver",
      flex: 0.5,
      renderCell: (params: any) => (
        <Link href={getViewLink(params.row)}>
          <VisibilityIcon color="primary" />
        </Link>
      ),
    },
  ];

  const getViewLink = (item: any) => {
    const { tipo, id } = item;
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

  useEffect(() => {
    fetchTiposOperacion();

    // Get tipoOperacionId from URL if present
    const tipoOpId = searchParams.get("tipoOperacionId");
    if (tipoOpId) {
      setSelectedTipoOperacion(tipoOpId);
    }
  }, [fetchTiposOperacion, searchParams]);

  // Build the API endpoint with the tipoOperacionId filter if selected
  const getApiEndpoint = useCallback(() => {
    let endpoint = "/api/resumen-transacciones";
    if (selectedTipoOperacion) {
      endpoint += `?tipoOperacionId=${selectedTipoOperacion}`;
    }
    return endpoint;
  }, [selectedTipoOperacion]);

  const handleTipoOperacionChange = (event: any) => {
    const value = event.target.value;
    setSelectedTipoOperacion(value === "all" ? null : value);

    // Update URL with the selected filter
    const url = new URL(window.location.href);
    if (value === "all") {
      url.searchParams.delete("tipoOperacionId");
    } else {
      url.searchParams.set("tipoOperacionId", value);
    }

    // Reset to first page when changing filters
    url.searchParams.set("page", "0");

    router.push(`?${url.searchParams.toString()}`);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2, mt: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="tipo-operacion-label">Tipo de Operación</InputLabel>
          <Select
            labelId="tipo-operacion-label"
            id="tipo-operacion-select"
            value={selectedTipoOperacion || "all"}
            onChange={handleTipoOperacionChange}
            label="Tipo de Operación"
          >
            <MenuItem value="all">Todos</MenuItem>
            {tiposOperacion.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id.toString()}>
                {tipo.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CustomTable
        apiEndpoint={getApiEndpoint()}
        columns={columns}
        ctaCb={ctaCb}
        searchByDate={true}
        {...rest}
      />
    </Box>
  );
}

export default ResumenTransaccionesTable;
