"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

interface RecordatorioAgenda {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hecho: boolean;
}

export default function AgendaPage() {
  const theme = useTheme();
  const { authFetch } = useFetch();

  // Estado para el mes actual
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Estado para los recordatorios
  const [recordatorios, setRecordatorios] = useState<RecordatorioAgenda[]>([]);

  // Estado para los feriados
  const [feriados, setFeriados] = useState<
    { id: number; fecha: string; descripcion: string }[]
  >([]);

  // Estado para el modal de creación/edición
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRecordatorio, setSelectedRecordatorio] =
    useState<RecordatorioAgenda | null>(null);

  // Estados para el formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hecho, setHecho] = useState(false);

  // Estado para errores
  const [error, setError] = useState<string | null>(null);

  // Estado para el diálogo de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordatorioToDelete, setRecordatorioToDelete] = useState<
    number | null
  >(null);

  // Estado para el menú
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRecordatorio, setActiveRecordatorio] =
    useState<RecordatorioAgenda | null>(null);

  // Cargar recordatorios del mes actual
  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() es 0-indexed

        const response = await authFetch(
          `/api/agenda?year=${year}&month=${month}`
        );
        const data = await response.json();

        if (response.ok) {
          setRecordatorios(data.items);
        } else {
          console.error("Error al cargar recordatorios:", data.error);
        }
      } catch (error) {
        console.error("Error al cargar recordatorios:", error);
      }
    };

    fetchRecordatorios();
  }, [currentMonth, authFetch]);

  // Cargar feriados
  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const response = await authFetch(
          `/api/feriados/monthly?year=${year}&month=${month}`
        );
        const data = await response.json();

        if (response.ok) {
          setFeriados(data);
        } else {
          console.error("Error al cargar feriados:", data.error);
        }
      } catch (error) {
        console.error("Error al cargar feriados:", error);
      }
    };

    fetchFeriados();
  }, [currentMonth, authFetch]);

  // Funciones para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generar días del mes actual y añadir días de relleno para el inicio del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Generar array con todos los días del mes
  const allDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Crear un array para representar el calendario completo con las posiciones correctas
  const calendarGrid: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = Array(7).fill(null); // 7 días por semana (incluyendo fines de semana)
  let currentWeekIndex = 0;

  // Procesar todos los días del mes
  allDaysInMonth.forEach((day) => {
    const dayOfWeek = getDay(day);

    // Convertir día de la semana a índice de 0-6 (domingo-sábado)
    // 0 (domingo) -> 0, 1 (lunes) -> 1, ..., 6 (sábado) -> 6
    const weekdayIndex = dayOfWeek;

    // Si estamos en una nueva semana, añadir la semana anterior al grid y crear una nueva
    if (weekdayIndex < currentWeekIndex) {
      calendarGrid.push([...currentWeek]);
      currentWeek = Array(7).fill(null);
      currentWeekIndex = 0;
    }

    // Actualizar el índice de la semana actual
    currentWeekIndex = weekdayIndex + 1;

    // Colocar el día en la posición correcta de la semana
    currentWeek[weekdayIndex] = day;
  });

  // Añadir la última semana si no está vacía
  if (currentWeek.some((day) => day !== null)) {
    calendarGrid.push([...currentWeek]);
  }

  // Verificar si un día es feriado
  const isFeriado = (day: Date) => {
    return feriados.some((feriado) => {
      const feriadoDate = new Date(feriado.fecha);
      return isSameDay(feriadoDate, day);
    });
  };

  // Obtener descripción del feriado
  const getFeriadoDescripcion = (day: Date) => {
    const feriado = feriados.find((feriado) => {
      const feriadoDate = new Date(feriado.fecha);
      return isSameDay(feriadoDate, day);
    });
    return feriado ? feriado.descripcion : "";
  };

  // Obtener recordatorios para un día específico
  const getRecordatoriosForDay = (day: Date) => {
    return recordatorios.filter((recordatorio) => {
      const recordatorioDate = new Date(recordatorio.fecha);
      return isSameDay(recordatorioDate, day);
    });
  };

  // Abrir modal para crear un nuevo recordatorio
  const handleCreateRecordatorio = (day: Date) => {
    // Verificar si es un día feriado
    if (isFeriado(day)) {
      return; // No permitir crear recordatorios en días feriados
    }

    setModalMode("create");
    setSelectedDate(day);
    setFecha(day);
    setTitulo("");
    setDescripcion("");
    setHecho(false);
    setSelectedRecordatorio(null);
    setOpenModal(true);
  };

  // Abrir modal para editar un recordatorio existente
  const handleEditRecordatorio = (recordatorio: RecordatorioAgenda) => {
    setModalMode("edit");
    setSelectedRecordatorio(recordatorio);
    setTitulo(recordatorio.titulo);
    setDescripcion(recordatorio.descripcion || "");
    setFecha(new Date(recordatorio.fecha));
    setHecho(recordatorio.hecho);
    setOpenModal(true);
  };

  // Guardar recordatorio (crear o editar)
  const handleSaveRecordatorio = async () => {
    try {
      setError(null);

      if (!titulo) {
        setError("El título es obligatorio");
        return;
      }

      if (!fecha) {
        setError("La fecha es obligatoria");
        return;
      }

      const recordatorioData = {
        titulo,
        descripcion: descripcion || undefined,
        fecha: fecha.toISOString(),
        hecho,
      };

      let response;

      if (modalMode === "create") {
        // Crear nuevo recordatorio
        response = await authFetch("/api/agenda", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordatorioData),
        });
      } else {
        // Actualizar recordatorio existente
        response = await authFetch(`/api/agenda/${selectedRecordatorio?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordatorioData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        // Actualizar la lista de recordatorios
        if (modalMode === "create") {
          setRecordatorios([...recordatorios, data]);
        } else {
          setRecordatorios(
            recordatorios.map((r) => (r.id === data.id ? data : r))
          );
        }

        // Cerrar el modal
        setOpenModal(false);
      } else {
        setError(data.error || "Error al guardar el recordatorio");
      }
    } catch (error) {
      console.error("Error al guardar recordatorio:", error);
      setError("Error al guardar el recordatorio");
    }
  };

  // Eliminar recordatorio
  const handleDeleteRecordatorio = async (id: number) => {
    try {
      const response = await authFetch(`/api/agenda/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar la lista de recordatorios
        setRecordatorios(recordatorios.filter((r) => r.id !== id));

        // Si estamos en el modal de edición, cerrarlo
        if (modalMode === "edit" && selectedRecordatorio?.id === id) {
          setOpenModal(false);
        }

        // Cerrar el diálogo de confirmación
        setDeleteConfirmOpen(false);
        setRecordatorioToDelete(null);
      } else {
        const data = await response.json();
        console.error("Error al eliminar recordatorio:", data.error);
      }
    } catch (error) {
      console.error("Error al eliminar recordatorio:", error);
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const confirmDelete = (id: number) => {
    setRecordatorioToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Marcar recordatorio como completado/pendiente
  const handleToggleHecho = async (recordatorio: RecordatorioAgenda) => {
    try {
      const response = await authFetch(`/api/agenda/${recordatorio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...recordatorio,
          hecho: !recordatorio.hecho,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar la lista de recordatorios
        setRecordatorios(
          recordatorios.map((r) => (r.id === data.id ? data : r))
        );
      } else {
        console.error("Error al actualizar estado:", data.error);
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    recordatorio: RecordatorioAgenda
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveRecordatorio(recordatorio);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle edit from menu
  const handleMenuEdit = () => {
    if (activeRecordatorio) {
      handleEditRecordatorio(activeRecordatorio);
    }
    handleMenuClose();
  };

  // Handle delete from menu
  const handleMenuDelete = () => {
    if (activeRecordatorio) {
      confirmDelete(activeRecordatorio.id);
    }
    handleMenuClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3, width: "100%" }}>
        <Typography variant="h4" gutterBottom>
          Agenda General
        </Typography>
        {/* Navegación del mes */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton onClick={goToPreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>

          <Typography variant="h6">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </Typography>

          <IconButton onClick={goToNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Paper>

        {/* Calendario */}
        <Grid
          container
          spacing={1}
          sx={{
            width: "100%",
            mx: "auto",
          }}
        >
          {/* Encabezados de días de la semana */}
          {[
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
          ].map((day) => (
            <Grid
              item
              xs={12 / 7}
              sm={12 / 7}
              md={12 / 7}
              key={day}
              sx={{
                minWidth: { xs: "auto", sm: "120px" },
                px: 0.5,
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  textAlign: "center",
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                  }}
                >
                  {day}
                </Typography>
              </Paper>
            </Grid>
          ))}

          {/* Renderizar el calendario por semanas y días */}
          {calendarGrid.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (day === null) {
                // Celda vacía
                return (
                  <Grid
                    item
                    xs={12 / 7}
                    sm={12 / 7}
                    md={12 / 7}
                    key={`empty-${weekIndex}-${dayIndex}`}
                    sx={{
                      minWidth: { xs: "auto", sm: "120px" },
                      px: 0.5,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        height: { xs: 120, sm: 140, md: 160 },
                        bgcolor: theme.palette.grey[100],
                      }}
                    />
                  </Grid>
                );
              }

              const dayRecordatorios = getRecordatoriosForDay(day);
              const isToday = isSameDay(day, new Date());
              const esFeriado = isFeriado(day);
              const feriadoDescripcion = esFeriado
                ? getFeriadoDescripcion(day)
                : "";

              return (
                <Grid
                  item
                  xs={12 / 7}
                  sm={12 / 7}
                  md={12 / 7}
                  key={day.toISOString()}
                  sx={{
                    minWidth: { xs: "auto", sm: "120px" },
                    px: 0.5,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      height: { xs: 120, sm: 140, md: 160 },
                      overflow: "auto",
                      position: "relative",
                      border: isToday
                        ? `2px solid ${theme.palette.primary.main}`
                        : "none",
                      bgcolor: esFeriado ? "#FAA0A0" : "white",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      {/* Header with date and add button */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: isToday ? "bold" : "normal",
                          }}
                        >
                          {format(day, "d")}
                        </Typography>

                        <Tooltip
                          title={
                            esFeriado
                              ? "No se pueden crear eventos en días feriados"
                              : ""
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleCreateRecordatorio(day)}
                              disabled={esFeriado}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>

                      {/* Mostrar descripción del feriado si es un día feriado */}
                      {esFeriado && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 1,
                            fontWeight: "bold",
                            color: theme.palette.error.dark,
                          }}
                        >
                          {feriadoDescripcion}
                        </Typography>
                      )}

                      {/* Contenedor para los recordatorios con scroll */}
                      <Box
                        sx={{
                          overflowY: "auto",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {/* Mostrar recordatorios del día */}
                        {dayRecordatorios.map((recordatorio) => (
                          <Box
                            key={recordatorio.id}
                            sx={{
                              p: 0.5,
                              bgcolor: recordatorio.hecho
                                ? "rgba(76, 175, 80, 0.1)"
                                : "rgba(33, 150, 243, 0.1)",
                              borderRadius: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "flex-start",
                              width: "100%",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                flexGrow: 1,
                                width: "calc(100% - 40px)", // Reserve space for the menu button
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleToggleHecho(recordatorio)}
                                sx={{ mr: 0.1, mt: 0 }}
                              >
                                {recordatorio.hecho ? (
                                  <CheckCircleIcon
                                    fontSize="small"
                                    color="success"
                                  />
                                ) : (
                                  <RadioButtonUncheckedIcon
                                    fontSize="small"
                                    color="primary"
                                  />
                                )}
                              </IconButton>

                              <Tooltip
                                title={
                                  recordatorio.descripcion || "Sin descripción"
                                }
                                arrow
                                placement="top"
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    flexGrow: 1,
                                    overflow: "visible",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    textDecoration: recordatorio.hecho
                                      ? "line-through"
                                      : "none",
                                    cursor: "default",
                                  }}
                                >
                                  {recordatorio.titulo}
                                </Typography>
                              </Tooltip>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={(event) =>
                                handleMenuOpen(event, recordatorio)
                              }
                              sx={{ alignSelf: "flex-start" }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Menu for edit/delete options */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleMenuEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleMenuDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        </Menu>

        {/* Modal de creación/edición */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {modalMode === "create"
              ? "Crear recordatorio"
              : "Editar recordatorio"}
          </DialogTitle>

          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Título"
                fullWidth
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                margin="normal"
                required
                error={error && !titulo ? true : false}
                helperText={error && !titulo ? "El título es obligatorio" : ""}
              />

              <TextField
                label="Descripción"
                fullWidth
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />

              <DatePicker
                label="Fecha"
                value={fecha}
                onChange={(newValue) =>
                  setFecha(newValue ? new Date(newValue.valueOf()) : null)
                }
                sx={{ mt: 2, width: "100%" }}
              />

              <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => setHecho(!hecho)} sx={{ mr: 1 }}>
                  {hecho ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon color="primary" />
                  )}
                </IconButton>

                <Typography>{hecho ? "Completado" : "Pendiente"}</Typography>
              </Box>

              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>

            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={handleSaveRecordatorio}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de confirmación de eliminación */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro que desea eliminar este recordatorio?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() =>
                recordatorioToDelete &&
                handleDeleteRecordatorio(recordatorioToDelete)
              }
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
