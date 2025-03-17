import usePrevOrdenes from "@/hooks/orden-reparacion/usePrevOrdenes";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const ObservacionesEntradaForm = () => {
  const { setValue, watch } = useFormContext();
  const observaciones = JSON.parse(watch("observacionesEntrada"));
  const [open, setOpen] = useState(false);
  const [newObservacion, setNewObservacion] = useState("");
  const { reparacionesAnteriores } = usePrevOrdenes();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewObservacion("");
  };

  const handleAdd = () => {
    if (newObservacion.trim()) {
      setValue(
        "observacionesEntrada",
        JSON.stringify([...observaciones, newObservacion.trim()])
      );
      setNewObservacion("");
      setOpen(false);
    }
  };

  const handleAddPreviousObservation = (observation: string) => {
    if (!observaciones.includes(observation)) {
      setValue(
        "observacionesEntrada",
        JSON.stringify([...observaciones, observation])
      );
      setSnackbar({
        open: true,
        message: "Observación agregada correctamente",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Esta observación ya fue agregada",
      });
    }
  };

  const handleDelete = (index: number) => {
    const newObservaciones = [...observaciones];
    newObservaciones.splice(index, 1);
    setValue("observacionesEntrada", JSON.stringify(newObservaciones));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          size="medium"
          sx={{ mb: 2 }}
        >
          Agregar observación
        </Button>

        {observaciones.length > 0 ? (
          <List>
            {observaciones.map((obs: string, index: number) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
                divider
              >
                <ListItemText primary={obs} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ fontStyle: "italic", py: 2 }}
          >
            No hay observaciones de entrada registradas
          </Typography>
        )}
      </Box>

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
                },
                index
              ) => (
                <Box key={reparacion.id}>
                  {index > 0 && <Divider />}
                  <Box p={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={new Date(
                          reparacion.fechaCreacion
                        ).toLocaleDateString()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <List dense disablePadding>
                      {JSON.parse(reparacion.observacionesSalida).map(
                        (obs: string, obsIndex: number) => (
                          <ListItem
                            key={obsIndex}
                            sx={{ py: 0.5 }}
                            secondaryAction={
                              <Tooltip title="Agregar a observaciones actuales">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() =>
                                    handleAddPreviousObservation(obs)
                                  }
                                  color="primary"
                                >
                                  AGREGAR
                                </Button>
                              </Tooltip>
                            }
                          >
                            <ListItemText
                              primary={obs}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Box>
                </Box>
              )
            )}
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
            <Typography
              color="text.secondary"
              sx={{ fontStyle: "italic", textAlign: "center" }}
            >
              No hay reparaciones previas para este vehículo
            </Typography>
          </Paper>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar observación de entrada</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Observación"
            fullWidth
            multiline
            rows={4}
            value={newObservacion}
            onChange={(e) => setNewObservacion(e.target.value)}
            placeholder="Describa el estado del vehículo al ingresar al taller"
            helperText="Incluya detalles como rasguños, abolladuras o cualquier detalle relevante sobre el estado del vehículo"
          />
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 4 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleAdd}
            color="primary"
            variant="contained"
            disabled={!newObservacion.trim()}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ObservacionesEntradaForm;
