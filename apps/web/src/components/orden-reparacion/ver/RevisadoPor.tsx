"use client";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";

function RevisadoPor({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();

  // Check if the order has been reviewed
  const hasReviewer = ordenReparacion.revisadoPor !== null;

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
        <VerifiedUserIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Revisión de Calidad
      </Typography>

      <Box sx={{ p: 3 }}>
        {hasReviewer ? (
          <Stack spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 500, width: 140 }}
              >
                Revisado Por:
              </Typography>
              <Typography variant="body1">
                {ordenReparacion.revisadoPor.fullName}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Esta orden no ha sido revisada.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default RevisadoPor;
