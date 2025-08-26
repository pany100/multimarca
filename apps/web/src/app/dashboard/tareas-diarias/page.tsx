"use client";

import { useAuth } from "@/hooks/useAuth";
import useTareasDiarias from "@/sections/tareas-diarias/hooks/useTareasDiarias";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
  TextField,
  Typography,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

interface TareaDiaria {
  id: number;
  descripcion: string;
  realizado: boolean;
  fecha: string;
  usuarioId: number;
  usuario?: {
    id: number;
    fullName: string;
    username: string;
  };
}

interface TareasAgrupadasPorFecha {
  [fecha: string]: TareaDiaria[];
}

const TareasDiariasPage = () => {
  const [fechaActual, setFechaActual] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dialogoCrearAbierto, setDialogoCrearAbierto] = useState(false);
  const [nuevaTareaDescripcion, setNuevaTareaDescripcion] = useState("");
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<TareaDiaria | null>(null);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [tareaEliminar, setTareaEliminar] = useState<TareaDiaria | null>(null);
  const { userData } = useAuth();
  console.log(userData);
  const {
    tareas,
    loading,
    error,
    obtenerTareasDiarias,
    crearTareaDiaria,
    actualizarTareaDiaria,
    cambiarEstadoTarea,
    eliminarTareaDiaria,
  } = useTareasDiarias({
    onSuccess: () => obtenerTareasDiarias(fechaActual, true),
  });

  useEffect(() => {
    obtenerTareasDiarias(fechaActual, true);
  }, [fechaActual]);

  // Agrupar tareas por fecha
  const agruparTareasPorFecha = (
    tareas: TareaDiaria[]
  ): TareasAgrupadasPorFecha => {
    return tareas.reduce((agrupadas: TareasAgrupadasPorFecha, tarea) => {
      const fechaFormateada = format(parseISO(tarea.fecha), "yyyy-MM-dd");

      if (!agrupadas[fechaFormateada]) {
        agrupadas[fechaFormateada] = [];
      }

      agrupadas[fechaFormateada].push(tarea);
      return agrupadas;
    }, {});
  };

  const tareasAgrupadas = agruparTareasPorFecha(tareas);
  const fechasOrdenadas = Object.keys(tareasAgrupadas).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Manejadores
  const handleCrearTarea = async () => {
    if (nuevaTareaDescripcion.trim()) {
      await crearTareaDiaria(nuevaTareaDescripcion);
      setNuevaTareaDescripcion("");
      setDialogoCrearAbierto(false);
    }
  };

  const handleEditarTarea = (tarea: TareaDiaria) => {
    setTareaEditando(tarea);
    setDialogoEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (tareaEditando && tareaEditando.descripcion.trim()) {
      await actualizarTareaDiaria(tareaEditando.id, {
        descripcion: tareaEditando.descripcion,
      });
      setDialogoEditarAbierto(false);
      setTareaEditando(null);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (tareaEliminar) {
      await eliminarTareaDiaria(tareaEliminar.id);
      setDialogoEliminarAbierto(false);
      setTareaEliminar(null);
    }
  };

  const formatearFecha = (fechaStr: string): string => {
    // Si es la fecha actual, mostrar "Hoy"
    const hoy = format(new Date(), "yyyy-MM-dd");

    if (fechaStr === hoy) {
      return "Hoy";
    }

    // Formatear la fecha en estilo español
    return format(parseISO(fechaStr), "EEEE, d 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Tareas Diarias</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogoCrearAbierto(true)}
        >
          Nueva Tarea
        </Button>
      </Box>

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tareas agrupadas por fecha */}
      {!loading && fechasOrdenadas.length === 0 && (
        <Alert severity="info">No hay tareas pendientes</Alert>
      )}

      {fechasOrdenadas.map((fecha) => (
        <Paper elevation={2} sx={{ mb: 3, overflow: "hidden" }} key={fecha}>
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="h6">{formatearFecha(fecha)}</Typography>
          </Box>
          <List>
            {tareasAgrupadas[fecha].map((tarea, index) => (
              <Box key={tarea.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        edge="end"
                        checked={tarea.realizado}
                        onChange={(e) =>
                          cambiarEstadoTarea(tarea.id, e.target.checked)
                        }
                        disabled={userData?.id !== tarea.usuarioId}
                      />
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditarTarea(tarea)}
                        disabled={userData?.id !== tarea.usuarioId}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setTareaEliminar(tarea);
                          setDialogoEliminarAbierto(true);
                        }}
                        disabled={userData?.id !== tarea.usuarioId}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${tarea.usuario?.fullName} - ${tarea.descripcion}`}
                    sx={{
                      textDecoration: tarea.realizado ? "line-through" : "none",
                      color: tarea.realizado ? "text.disabled" : "text.primary",
                      marginRight: "64px",
                    }}
                  />
                </ListItem>
                {index < tareasAgrupadas[fecha].length - 1 && (
                  <Divider component="li" />
                )}
              </Box>
            ))}
          </List>
        </Paper>
      ))}

      {/* Diálogo para crear nueva tarea */}
      <Dialog
        open={dialogoCrearAbierto}
        onClose={() => setDialogoCrearAbierto(false)}
        PaperProps={{
          sx: {
            width: "100%",
            minWidth: "500px",
            maxWidth: "800px",
          },
        }}
      >
        <DialogTitle>Nueva Tarea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={nuevaTareaDescripcion}
            onChange={(e) => setNuevaTareaDescripcion(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoCrearAbierto(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCrearTarea}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar tarea */}
      <Dialog
        open={dialogoEditarAbierto}
        onClose={() => setDialogoEditarAbierto(false)}
        PaperProps={{
          sx: {
            width: "100%",
            minWidth: "500px",
            maxWidth: "800px",
          },
        }}
      >
        <DialogTitle>Editar Tarea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={tareaEditando?.descripcion || ""}
            onChange={(e) =>
              tareaEditando &&
              setTareaEditando({
                ...tareaEditando,
                descripcion: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEditarAbierto(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEdicion}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog
        open={dialogoEliminarAbierto}
        onClose={() => setDialogoEliminarAbierto(false)}
      >
        <DialogTitle>Eliminar Tarea</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta tarea?
          </Typography>
          {tareaEliminar && (
            <Typography sx={{ mt: 1, fontStyle: "italic" }}>
              &quot;{tareaEliminar.descripcion}&quot;
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEliminarAbierto(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TareasDiariasPage;
