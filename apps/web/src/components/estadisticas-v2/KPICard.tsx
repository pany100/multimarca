"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, Paper, Skeleton, Typography } from "@mui/material";

interface KPICardProps {
  label: string;
  value: number | null;
  previousValue?: number | null;
  format?: "currency" | "percent" | "number";
  loading?: boolean;
}

function formatValue(value: number, format: "currency" | "percent" | "number") {
  if (format === "currency") {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat("es-AR").format(value);
}

function calcVariation(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function KPICard({
  label,
  value,
  previousValue,
  format = "currency",
  loading = false,
}: KPICardProps) {
  const variation =
    value != null && previousValue != null
      ? calcVariation(value, previousValue)
      : null;

  const isPositive = variation != null && variation >= 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, fontWeight: 500 }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width="70%" height={40} />
      ) : (
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value != null ? formatValue(value, format) : "-"}
        </Typography>
      )}
      {!loading && variation != null && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 0.5 }}>
          {isPositive ? (
            <ArrowUpwardIcon sx={{ fontSize: 16, color: "success.main" }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 16, color: "error.main" }} />
          )}
          <Typography
            variant="caption"
            sx={{ color: isPositive ? "success.main" : "error.main", fontWeight: 600 }}
          >
            {Math.abs(variation).toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs mes anterior
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
