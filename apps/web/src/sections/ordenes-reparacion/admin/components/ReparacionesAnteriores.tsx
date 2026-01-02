import HistoryIcon from "@mui/icons-material/History";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useOrden } from "../contexts/OrdenContext";
import { usePreviousReparations } from "../hooks/usePreviousReparations";
import ReparacionAnteriorItem from "./ReparacionAnteriorItem";

type Props = {
  addObservacion: (observacion: string) => void;
};

function ReparacionesAnteriores({ addObservacion }: Props) {
  const { orden } = useOrden();
  const { reparacionesAnteriores, loading } = usePreviousReparations(
    orden?.autoId
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <HistoryIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="subtitle1" fontWeight="medium">
          Reparaciones previas
        </Typography>
      </Box>
      {reparacionesAnteriores.length > 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 1 }}>
          {reparacionesAnteriores
            .filter(
              (reparacion: {
                id: number;
                fechaCreacion: string;
                fechaSalidaReparacion: string;
                observacionesSalida: string;
                kilometros: number;
              }) => {
                const observacionesSalida = JSON.parse(
                  reparacion.observacionesSalida || "[]"
                );
                return observacionesSalida.length > 0;
              }
            )
            .map(
              (
                reparacion: {
                  id: number;
                  fechaCreacion: string;
                  fechaSalidaReparacion: string;
                  observacionesSalida: string;
                  kilometros: number;
                },
                index: number
              ) => (
                <ReparacionAnteriorItem
                  key={reparacion.id}
                  reparacion={reparacion}
                  index={index}
                  addObservacion={addObservacion}
                />
              )
            )}
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            No hay reparaciones previas para este vehículo
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ReparacionesAnteriores;
