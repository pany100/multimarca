"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, ButtonGroup, IconButton, Paper } from "@mui/material";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { useState } from "react";

export interface FiltroEstadisticas {
  from: string | null;
  to: string | null;
}

interface GlobalFiltersProps {
  onApply: (filtro: FiltroEstadisticas) => void;
  defaultFrom?: Date | null;
  defaultTo?: Date | null;
  showPeriodPresets?: boolean;
}

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

function presetMesActual(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from, to };
}

function presetTrimestreActual(): { from: Date; to: Date } {
  const now = new Date();
  const trimStart = Math.floor(now.getMonth() / 3) * 3;
  const from = new Date(now.getFullYear(), trimStart, 1);
  const to = new Date(now.getFullYear(), trimStart + 3, 1);
  return { from, to };
}

function presetAnioActual(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), 0, 1);
  const to = new Date(now.getFullYear() + 1, 0, 1);
  return { from, to };
}

export default function GlobalFilters({
  onApply,
  defaultFrom,
  defaultTo,
  showPeriodPresets = false,
}: GlobalFiltersProps) {
  const [fromDate, setFromDate] = useState<Date | null>(defaultFrom ?? null);
  const [toDate, setToDate] = useState<Date | null>(defaultTo ?? null);

  const handleApply = () => {
    onApply({ from: formatDate(fromDate), to: formatDate(toDate) });
  };

  const applyPreset = (range: { from: Date; to: Date }) => {
    setFromDate(range.from);
    setToDate(range.to);
    onApply({ from: formatDate(range.from), to: formatDate(range.to) });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: "background.default",
        borderRadius: 2,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <DatePicker
              label="Desde"
              value={fromDate}
              onChange={(value: PickerValue, context: PickerChangeHandlerContext<DateValidationError>) => {
                if (!context.validationError) setFromDate(value as Date | null);
              }}
              format="dd-MM-yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 200,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.paper",
                    },
                  },
                },
              }}
            />
            {fromDate && (
              <IconButton
                size="small"
                onClick={() => setFromDate(null)}
                sx={{ position: "absolute", right: 35, top: "50%", transform: "translateY(-50%)", p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ position: "relative" }}>
            <DatePicker
              label="Hasta"
              value={toDate}
              onChange={(value: PickerValue, context: PickerChangeHandlerContext<DateValidationError>) => {
                if (!context.validationError) setToDate(value as Date | null);
              }}
              format="dd-MM-yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 200,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.paper",
                    },
                  },
                },
              }}
            />
            {toDate && (
              <IconButton
                size="small"
                onClick={() => setToDate(null)}
                sx={{ position: "absolute", right: 35, top: "50%", transform: "translateY(-50%)", p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleApply}
            sx={{ height: 40 }}
          >
            Buscar
          </Button>
          {showPeriodPresets && (
            <ButtonGroup size="small" variant="outlined" sx={{ height: 40 }}>
              <Button onClick={() => applyPreset(presetMesActual())}>
                Mes en curso
              </Button>
              <Button onClick={() => applyPreset(presetTrimestreActual())}>
                Trimestre en curso
              </Button>
              <Button onClick={() => applyPreset(presetAnioActual())}>
                Año en curso
              </Button>
            </ButtonGroup>
          )}
        </Box>
      </LocalizationProvider>
    </Paper>
  );
}
