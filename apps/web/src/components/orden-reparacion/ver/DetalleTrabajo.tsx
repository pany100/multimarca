"use client";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { Box, Paper, Typography, useTheme } from "@mui/material";

function DetalleTrabajo({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();

  // Check if the order has internal notes
  const hasInternalNotes =
    ordenReparacion.detallesDeTrabajo &&
    ordenReparacion.detallesDeTrabajo.trim() !== "";

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <StickyNote2Icon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Trabajos a realizar
      </Typography>

      <Box sx={{ p: 3 }}>
        {hasInternalNotes ? (
          <Box
            sx={{
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 193, 7, 0.08)"
                  : "rgba(255, 193, 7, 0.1)",
              p: 2,
              borderRadius: 1,
              borderLeft: "4px solid",
              borderColor: "warning.main",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                color: theme.palette.text.primary,
              }}
            >
              {ordenReparacion.detallesDeTrabajo}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No hay detalle de trabajo agregado para la reparación
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default DetalleTrabajo;
