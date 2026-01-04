import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useObservacionesManager } from "../hooks/useObservacionesManager";

type Props = {
  reparacion: {
    id: number;
    fechaCreacion: string;
    fechaSalidaReparacion: string;
    observacionesSalida: string;
    kilometros: number;
  };
  index: number;
  addObservacion: (observacion: string) => void;
};

function ReparacionAnteriorItem({ reparacion, index, addObservacion }: Props) {
  const { observacionesArray } = useObservacionesManager();

  const isObservationAlreadyAdded = (observation: string) => {
    return observacionesArray.includes(observation);
  };

  const observacionesSalida = JSON.parse(
    reparacion.observacionesSalida || "[]"
  );

  return (
    <Box>
      {index > 0 && <Divider />}
      <Box p={1}>
        <Box display="flex" alignItems="center">
          <Chip
            label={new Date(reparacion.fechaCreacion).toLocaleDateString(
              "es-AR"
            )}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <List dense disablePadding>
          {observacionesSalida.map((obs: string, obsIndex: number) => {
            const obsString = `${new Date(
              reparacion.fechaCreacion
            ).toLocaleDateString("es-AR")} - Kms: ${
              reparacion.kilometros
            } - ${obs}`;
            const ultimoIngreso = `Observación último ingreso: ${obsString}`;
            return (
              <ListItem
                key={obsIndex}
                sx={{ py: 0.5, pr: 12 }}
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
                        onClick={() => addObservacion(ultimoIngreso)}
                        color="primary"
                        disabled={isObservationAlreadyAdded(ultimoIngreso)}
                      >
                        AGREGAR
                      </Button>
                    </span>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={obsString}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { pr: 2 },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

export default ReparacionAnteriorItem;
