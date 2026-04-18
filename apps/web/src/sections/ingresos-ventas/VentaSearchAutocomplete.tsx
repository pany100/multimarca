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

export interface VentaConDeuda {
  id: number;
  fecha: string;
  estado: string;
  clienteId: number | null;
  informacionCliente: string | null;
  clienteNombre: string | null;
  totalAPagar: number;
  totalPagado: number;
  deuda: number;
}

interface Props {
  value: VentaConDeuda | null;
  onChange: (venta: VentaConDeuda | null) => void;
  error?: string;
}

export default function VentaSearchAutocomplete({
  value,
  onChange,
  error,
}: Props) {
  const { authFetch } = useFetch();
  const [options, setOptions] = useState<VentaConDeuda[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchVentas = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await authFetch(
          `/api/ventas/con-deuda?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setOptions(data);
      } catch (err) {
        console.error("Error buscando ventas:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const debouncedFetch = useMemo(
    () => debounce(fetchVentas, 300),
    [fetchVentas]
  );

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

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
          `#${option.id} - ${option.clienteNombre || "Sin cliente"}`
        }
        isOptionEqualToValue={(option, val) => option.id === val.id}
        noOptionsText={
          inputValue.length < 2
            ? "Escribí al menos 2 caracteres"
            : "No se encontraron ventas con deuda"
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
                  Venta #{option.id} — {option.clienteNombre || "Sin cliente"}
                </Typography>
                <Chip
                  label={`Deuda: ${getFormattedPrice(option.deuda)}`}
                  color="warning"
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
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
            label="Buscar por # de venta o nombre de cliente"
            placeholder="Ej: 142, Juan Pérez..."
            error={!!error}
            helperText={error}
            fullWidth
          />
        )}
      />

      {value && <VentaResumenCard venta={value} />}
    </Box>
  );
}

function VentaResumenCard({ venta }: { venta: VentaConDeuda }) {
  const porcentajePagado =
    venta.totalAPagar > 0
      ? Math.min((venta.totalPagado / venta.totalAPagar) * 100, 100)
      : 0;

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
            Venta #{venta.id}
          </Typography>
          <Chip label={venta.estado} size="small" variant="outlined" />
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
              Cliente
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {venta.clienteNombre || "Sin cliente"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body2">
              {new Date(venta.fecha).toLocaleDateString("es-AR")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Estado
            </Typography>
            <Typography variant="body2">{venta.estado}</Typography>
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
              {getFormattedPrice(venta.totalAPagar)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pagado
            </Typography>
            <Typography variant="body2" color="success.main">
              {getFormattedPrice(venta.totalPagado)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Deuda pendiente
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="warning.main">
              {getFormattedPrice(venta.deuda)}
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
