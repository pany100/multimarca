import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useOrden } from "../contexts/OrdenContext";
import { usePreviousReparations } from "../hooks/usePreviousReparations";

type Props = {
  addObservacion: (observacion: string) => void;
  observacionesActuales: string[];
};

function ReparacionesAnteriores({
  addObservacion,
  observacionesActuales,
}: Props) {
  const { orden } = useOrden();
  const { reparacionesAnteriores, loading } = usePreviousReparations(
    orden?.autoId
  );

  const isObservationAlreadyAdded = (observation: string) => {
    return observacionesActuales.includes(observation);
  };

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
              ) => {
                const observacionesSalida = JSON.parse(
                  reparacion.observacionesSalida || "[]"
                );

                return (
                  <Box key={reparacion.id}>
                    {index > 0 && <Divider />}
                    <Box p={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip
                          label={new Date(
                            reparacion.fechaCreacion
                          ).toLocaleDateString("es-AR")}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <List dense disablePadding>
                        {observacionesSalida.map(
                          (obs: string, obsIndex: number) => {
                            const obsString = `${new Date(
                              reparacion.fechaCreacion
                            ).toLocaleDateString("es-AR")} - Kms: ${
                              reparacion.kilometros
                            } - ${obs}`;
                            const ultimoIngreso = `Observación último ingreso: ${obsString}`;
                            return (
                              <ListItem
                                key={obsIndex}
                                sx={{ py: 0.5 }}
                                secondaryAction={
                                  <Tooltip
                                    title={
                                      isObservationAlreadyAdded(ultimoIngreso)
                                        ? "Esta observación ya fue agregada"
                                        : "Agregar a observaciones actuales"
                                    }
                                  >
                                    <span>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() =>
                                          addObservacion(ultimoIngreso)
                                        }
                                        color="primary"
                                        disabled={isObservationAlreadyAdded(
                                          ultimoIngreso
                                        )}
                                      >
                                        AGREGAR
                                      </Button>
                                    </span>
                                  </Tooltip>
                                }
                              >
                                <ListItemText
                                  primary={obsString}
                                  primaryTypographyProps={{ variant: "body2" }}
                                />
                              </ListItem>
                            );
                          }
                        )}
                      </List>
                    </Box>
                  </Box>
                );
              }
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
