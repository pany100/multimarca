"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TipoOperacion {
  id: number;
  label: string;
  esIngreso: boolean;
  esGasto: boolean;
}

interface TipoOperacionFilterProps {
  onFilterChange: (tipoOperacionId: string | null) => void;
}

export default function TipoOperacionFilter({
  onFilterChange,
}: TipoOperacionFilterProps) {
  const [tiposOperacion, setTiposOperacion] = useState<TipoOperacion[]>([]);
  const [selectedTipoOperacion, setSelectedTipoOperacion] = useState<
    string | null
  >(null);
  const { authFetch } = useFetch();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchTiposOperacion = async () => {
      try {
        const response = await authFetch("/api/tipo-operacion");
        const data = await response.json();
        if (data) {
          setTiposOperacion(data);
        }
      } catch (error) {
        console.error("Error al cargar tipos de operación:", error);
      }
    };

    fetchTiposOperacion();

    // Check if there's a tipoOperacionId in the URL
    const tipoOperacionId = searchParams.get("tipoOperacionId");
    if (tipoOperacionId) {
      setSelectedTipoOperacion(tipoOperacionId);
    }
  }, [authFetch, searchParams]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedTipoOperacion(value === "all" ? null : value);
    onFilterChange(value === "all" ? null : value);

    // Update URL with the selected filter
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("tipoOperacionId");
    } else {
      params.set("tipoOperacionId", value);
    }

    // Keep the page parameter if it exists
    const page = searchParams.get("page");
    if (page) {
      params.set("page", page);
    }

    router.push(`?${params.toString()}`);
  };

  const handleClearFilter = () => {
    setSelectedTipoOperacion(null);
    onFilterChange(null);

    // Remove the filter from URL but keep other parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tipoOperacionId");

    router.push(`?${params.toString()}`);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
      <FormControl sx={{ minWidth: 250 }}>
        <InputLabel id="tipo-operacion-filter-label">
          Filtrar por Tipo de Operación
        </InputLabel>
        <Select
          labelId="tipo-operacion-filter-label"
          id="tipo-operacion-filter"
          value={selectedTipoOperacion || "all"}
          label="Filtrar por Tipo de Operación"
          onChange={handleChange as any}
        >
          <MenuItem value="all">Todos los tipos</MenuItem>
          {tiposOperacion.map((tipo) => (
            <MenuItem key={tipo.id} value={tipo.id.toString()}>
              {tipo.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedTipoOperacion && (
        <Button variant="outlined" onClick={handleClearFilter}>
          Limpiar filtro
        </Button>
      )}
    </Box>
  );
}
