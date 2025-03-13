import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const ObservacionesEntradaForm = () => {
  const [observaciones, setObservaciones] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [newObservacion, setNewObservacion] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewObservacion("");
  };

  const handleAdd = () => {
    if (newObservacion.trim()) {
      setObservaciones([...observaciones, newObservacion.trim()]);
      setNewObservacion("");
      setOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newObservaciones = [...observaciones];
    newObservaciones.splice(index, 1);
    setObservaciones(newObservaciones);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        size="medium"
      >
        Agregar observación
      </Button>

      {observaciones.length > 0 ? (
        <List>
          {observaciones.map((obs, index) => (
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
        <Typography color="text.secondary" sx={{ fontStyle: "italic", py: 2 }}>
          No hay observaciones de entrada registradas
        </Typography>
      )}

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
    </>
  );
};

export default ObservacionesEntradaForm;
