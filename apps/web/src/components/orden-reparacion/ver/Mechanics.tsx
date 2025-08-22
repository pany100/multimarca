"use client";
import EngineeringIcon from "@mui/icons-material/Engineering";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function Mechanics({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Check if there are mechanics assigned
  const hasMechanics =
    ordenReparacion.mecanicos && ordenReparacion.mecanicos.length > 0;

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
        <EngineeringIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Mecánicos Asignados
      </Typography>

      <Box sx={{ p: 2 }}>
        {hasMechanics ? (
          <TableContainer component={Paper} elevation={0}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 500 }}>Mecánico</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Trabajo Realizado
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenReparacion.mecanicos.map(
                  (mecanico: {
                    id: string;
                    name: string;
                    detalle: string | null;
                  }) => (
                    <TableRow key={mecanico.id}>
                      <TableCell component="th" scope="row">
                        {mecanico.name}
                      </TableCell>
                      <TableCell>{mecanico.detalle || "-"}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay mecánicos asignados.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default Mechanics;
