import usePrevOrdenes from "@/hooks/orden-reparacion/usePrevOrdenes";
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";

type Props = {
  reparation: {
    id: string;
    fechaCreacion: string;
    fechaSalidaReparacion: string;
    observacionesSalida: string;
  };
  index: number;
};

function PreviousReparationEntry({ reparation, index }: Props) {
  const observaciones = JSON.parse(reparation.observacionesSalida);
  const { isObservationAlreadyAdded, handleAddPreviousObservation } =
    usePrevOrdenes();

  return (
    <Box key={reparation.id}>
      {index > 0 && <Divider />}
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={1}>
          <Chip
            label={new Date(reparation.fechaCreacion).toLocaleDateString()}
            size="small"
            color="primary"
            variant="outlined"
          />
          {observaciones.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ fontStyle: "italic", pl: 2 }}
            >
              No hay observaciones de salida registradas
            </Typography>
          )}
        </Box>
        <List dense disablePadding>
          {observaciones.map((obs: string, obsIndex: number) => (
            <ListItem
              key={obsIndex}
              sx={{ py: 0.5 }}
              secondaryAction={
                <Tooltip
                  title={
                    isObservationAlreadyAdded(obs)
                      ? "Esta observación ya fue agregada"
                      : "Agregar a observaciones actuales"
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddPreviousObservation(obs)}
                      color="primary"
                      disabled={isObservationAlreadyAdded(obs)}
                    >
                      AGREGAR
                    </Button>
                  </span>
                </Tooltip>
              }
            >
              <ListItemText
                primary={obs}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default PreviousReparationEntry;
