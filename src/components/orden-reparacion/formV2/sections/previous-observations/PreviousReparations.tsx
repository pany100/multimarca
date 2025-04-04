import usePrevOrdenes from "@/hooks/orden-reparacion/usePrevOrdenes";
import HistoryIcon from "@mui/icons-material/History";
import { Box, Paper, Typography } from "@mui/material";
import EmptyPreviousReparations from "./EmptyPreviousReparations";
import PreviousReparationEntry from "./PreviousReparationEntry";

function PreviousReparations() {
  const { reparacionesAnteriores } = usePrevOrdenes();
  return (
    <Box sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <HistoryIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="subtitle1" fontWeight="medium">
          Reparaciones previas
        </Typography>
      </Box>
      {reparacionesAnteriores.length > 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 1 }}>
          {reparacionesAnteriores.map(
            (
              reparacion: {
                id: string;
                fechaCreacion: string;
                fechaSalidaReparacion: string;
                observacionesSalida: string;
                kilometros: number;
              },
              index: number
            ) => (
              <PreviousReparationEntry
                key={reparacion.id}
                reparation={reparacion}
                index={index}
              />
            )
          )}
        </Paper>
      ) : (
        <EmptyPreviousReparations />
      )}
    </Box>
  );
}

export default PreviousReparations;
