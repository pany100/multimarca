"use client";

import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useState } from "react";

interface DiasParaRecordatorioInputProps {
  label?: string;
  value: number[];
  onChange: (dias: number[]) => void;
}

export default function DiasParaRecordatorioInput({
  label = "Recordatorio (opcional)",
  value,
  onChange,
}: DiasParaRecordatorioInputProps) {
  const [nuevoDia, setNuevoDia] = useState<string>("");

  const handleAgregar = () => {
    const n = parseInt(nuevoDia, 10);
    if (Number.isNaN(n) || n < 0) return;
    if (value.includes(n)) return;
    onChange([...value, n].sort((a, b) => a - b));
    setNuevoDia("");
  };

  const handleQuitar = (dia: number) => {
    onChange(value.filter((d) => d !== dia));
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <ORepTextField
          label="Días"
          type="number"
          value={nuevoDia}
          onChange={(e) => setNuevoDia(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAgregar();
            }
          }}
          placeholder="Ej: 30"
          inputProps={{ min: 0, step: 1 }}
        />
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAgregar}
          disabled={nuevoDia === "" || Number.isNaN(parseInt(nuevoDia, 10))}
        >
          Agregar
        </Button>
      </Stack>
      {value.length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
          {value.map((dia) => (
            <Chip
              key={dia}
              label={`${dia} días`}
              size="small"
              onDelete={() => handleQuitar(dia)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
