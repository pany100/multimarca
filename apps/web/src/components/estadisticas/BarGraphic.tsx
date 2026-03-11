"use client";

import { Box, CircularProgress } from "@mui/material";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

// Safe to call multiple times; Chart.js handles duplicate registration gracefully
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export type BarGraphicItem = {
  label: string;
  value: number;
};

export type BarGraphicProps = {
  data: BarGraphicItem[];
  title?: string;
  height?: number | string; // e.g., 420 or "420px"
  maxWidth?: number | string; // e.g., 1100 or "1100px"
  // Formatting options
  formatAsCurrency?: boolean;
  currency?: string; // e.g., "ARS"
  compactTicks?: boolean; // use compact notation for axis ticks
  color?: string; // rgba string for fill color
  borderColor?: string; // rgba string for border color
  loading?: boolean; // show spinner instead of chart when true
  barColors?: string[]; // optional per-bar colors (rgba/hex values)
};

const BarGraphic: React.FC<BarGraphicProps> = ({
  data,
  title,
  height = 420,
  maxWidth = 1100,
  formatAsCurrency = true,
  currency = "ARS",
  compactTicks = true,
  color = "rgba(255, 99, 132, 0.6)",
  borderColor = "rgba(255, 99, 132, 1)",
  loading = false,
  barColors,
}) => {
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y" as const,
      layout: {
        padding: { left: 24, right: 8, top: 8, bottom: 8 },
      },
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            boxWidth: 15,
            padding: 15,
            font: { size: 12 },
          },
        },
        title: {
          display: !!title,
          text: title,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              const value = context.parsed?.x ?? null;
              if (value !== null) {
                if (formatAsCurrency) {
                  return (
                    label +
                    new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency,
                      minimumFractionDigits: 2,
                    }).format(value)
                  );
                }
                return label + value;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => {
              if (!formatAsCurrency) return value;
              return new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency,
                ...(compactTicks
                  ? {
                      notation: "compact" as const,
                      compactDisplay: "short" as const,
                    }
                  : {}),
              }).format(value);
            },
          },
        },
        y: {
          ticks: {
            font: { size: 12 },
            autoSkip: false,
            maxTicksLimit: Math.max(data.length, 1),
            padding: 4,
          },
        },
      },
    };
  }, [title, formatAsCurrency, currency, compactTicks, data.length]);

  const generatedColors = useMemo(() => {
    if (barColors && barColors.length) return barColors;
    const n = Math.max(1, data.length);
    // Generate visually distinct colors using HSL spaced around the hue wheel
    const hues = Array.from({ length: n }, (_, i) => Math.round((360 / n) * i));
    return hues.map((h) => `hsla(${h}, 70%, 55%, 0.7)`);
  }, [barColors, data.length]);

  const generatedBorderColors = useMemo(() => {
    if (barColors && barColors.length) {
      // If custom colors were provided, use same without alpha if possible
      return barColors.map((c) => c);
    }
    const n = Math.max(1, data.length);
    const hues = Array.from({ length: n }, (_, i) => Math.round((360 / n) * i));
    return hues.map((h) => `hsl(${h}, 70%, 40%)`);
  }, [barColors, data.length]);

  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.label ?? ""),
      datasets: [
        {
          label: formatAsCurrency ? `Valor (${currency})` : "Valor",
          data: data.map((d) => d.value ?? 0),
          backgroundColor: data.length > 0 ? generatedColors : color,
          borderColor: data.length > 0 ? generatedBorderColors : borderColor,
          borderWidth: 1,
        },
      ],
    };
  }, [
    data,
    formatAsCurrency,
    currency,
    color,
    borderColor,
    generatedColors,
    generatedBorderColors,
  ]);

  return (
    <Box sx={{ height, display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth,
          display: "grid",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: typeof height === "number" ? `${height}px` : height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Bar options={options as any} data={chartData as any} />
        )}
      </Box>
    </Box>
  );
};

export default BarGraphic;
