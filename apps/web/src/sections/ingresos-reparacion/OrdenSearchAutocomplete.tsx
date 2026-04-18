"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface OrdenConDeuda {
  id: number;
  fecha: string;
  estado: string;
  auto: {
    patent: string;
    brand: string | null;
    model: string | null;
  } | null;
  clienteId: number | null;
  clienteNombre: string | null;
  totalAPagar: number;
  totalPagado: number;
  deuda: number;
}

interface Props {
  value: OrdenConDeuda | null;
  onChange: (orden: OrdenConDeuda | null) => void;
  error?: string;
}

export default function OrdenSearchAutocomplete({
  value,
  onChange,
  error,
}: Props) {
  const { authFetch } = useFetch();
  const [options, setOptions] = useState<OrdenConDeuda[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchOrdenes = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await authFetch(
          `/api/ordenes-reparacion/con-deuda?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setOptions(data);
      } catch (err) {
        console.error("Error buscando ordenes:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const debouncedFetch = useMemo(
    () => debounce(fetchOrdenes, 300),
    [fetchOrdenes]
  );

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const getAutoLabel = (orden: OrdenConDeuda) => {
    if (!orden.auto) return "";
    return [orden.auto.patent, orden.auto.brand, orden.auto.model]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <Box>
      <Autocomplete
        options={options}
        loading={loading}
        value={value}
        inputValue={inputValue}
        onInputChange={(_, newValue, reason) => {
          setInputValue(newValue);
          if (reason !== "reset") {
            debouncedFetch(newValue);
          }
        }}
        onChange={(_, newValue) => {
          onChange(newValue);
        }}
        getOptionLabel={(option) =>
          `#${option.id} - ${getAutoLabel(option)} - ${option.clienteNombre || "Sin cliente"}`
        }
        isOptionEqualToValue={(option, val) => option.id === val.id}
        noOptionsText={
          inputValue.length < 2
            ? "Escribi al menos 2 caracteres"
            : "No se encontraron ordenes con deuda"
        }
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box sx={{ width: "100%", py: 0.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  OdR #{option.id} — {getAutoLabel(option)}
                </Typography>
                <Chip
                  label={`Deuda: ${getFormattedPrice(option.deuda)}`}
                  color="warning"
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {option.clienteNombre || "Sin cliente"} —{" "}
                {new Date(option.fecha).toLocaleDateString("es-AR")} — Total:{" "}
                {getFormattedPrice(option.totalAPagar)} — Pagado:{" "}
                {getFormattedPrice(option.totalPagado)}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar por # de orden, patente o nombre de cliente"
            placeholder="Ej: 142, ABC123, Juan Perez..."
            error={!!error}
            helperText={error}
            fullWidth
          />
        )}
      />

      {value && <OrdenResumenCard orden={value} />}
    </Box>
  );
}

function OrdenResumenCard({ orden }: { orden: OrdenConDeuda }) {
  const porcentajePagado =
    orden.totalAPagar > 0
      ? Math.min((orden.totalPagado / orden.totalAPagar) * 100, 100)
      : 0;

  const autoLabel = orden.auto
    ? [orden.auto.patent, orden.auto.brand, orden.auto.model]
        .filter(Boolean)
        .join(" - ")
    : "Sin auto";

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            OdR #{orden.id}
          </Typography>
          <Chip label={orden.estado} size="small" variant="outlined" />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Auto
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {autoLabel}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Cliente
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {orden.clienteNombre || "Sin cliente"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body2">
              {new Date(orden.fecha).toLocaleDateString("es-AR")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {getFormattedPrice(orden.totalAPagar)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pagado
            </Typography>
            <Typography variant="body2" color="success.main">
              {getFormattedPrice(orden.totalPagado)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Deuda pendiente
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="warning.main">
              {getFormattedPrice(orden.deuda)}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Progreso de pago
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {porcentajePagado.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={porcentajePagado}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
