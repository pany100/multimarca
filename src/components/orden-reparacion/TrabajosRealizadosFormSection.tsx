import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ConstructionIcon from "@mui/icons-material/Construction";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function TrabajosRealizadosFormSection({
  esBorrador = false,
}: {
  esBorrador?: boolean;
}) {
  const { authFetch } = useFetch();
  const { control, getValues, setValue } = useFormContext();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openTrabajoModal, setOpenTrabajoModal] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState<{
    id: number;
    name: string;
    sellPrice: number;
  } | null>(null);
  const [trabajoOptions, setTrabajoOptions] = useState<
    Array<{ id: number; name: string; sellPrice: number }>
  >([]);
  const [nombreTrabajo, setNombreTrabajo] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [diasParaRecordatorio, setDiasParaRecordatorio] = useState("");
  const [tipoTrabajo, setTipoTrabajo] = useState<"lista" | "otros">("lista");
  const [editingTrabajoId, setEditingTrabajoId] = useState<string | null>(null);

  const searchTrabajos = async (query: string) => {
    const response = await authFetch(
      `/api/mano-de-obra?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setTrabajoOptions(
      data.items.map(
        (trabajo: { name: string; id: number; sellPrice: number }) => ({
          id: trabajo.id,
          name: trabajo.name,
          sellPrice: trabajo.sellPrice,
        })
      )
    );
  };

  const handleAddOrUpdateTrabajo = () => {
    const currentTrabajos = getValues("trabajosRealizados") || [];
    const newTrabajo = {
      id:
        editingTrabajoId ||
        `${selectedTrabajo?.id || "otros"}-${nombreTrabajo}`,
      manoDeObra:
        tipoTrabajo === "lista" ? selectedTrabajo : { name: nombreTrabajo },
      precioUnitario: Number(precioUnitario),
      diasParaRecordatorio: diasParaRecordatorio
        ? Number(diasParaRecordatorio)
        : null,
    };

    if (editingTrabajoId) {
      const updatedTrabajos = currentTrabajos.map((t: any) => {
        return t.id === editingTrabajoId ||
          `otros-${t.manoDeObra.name}` === editingTrabajoId
          ? newTrabajo
          : t;
      });
      setValue("trabajosRealizados", updatedTrabajos);
      setSnackbar({
        open: true,
        message: "Trabajo actualizado correctamente",
        severity: "success",
      });
      resetFields();
    } else {
      const trabajoExistente = currentTrabajos.find(
        (t: any) =>
          (tipoTrabajo === "lista" &&
            t.manoDeObra.id === selectedTrabajo?.id) ||
          (tipoTrabajo === "otros" && t.manoDeObra.name === nombreTrabajo)
      );

      if (trabajoExistente && !editingTrabajoId) {
        setSnackbar({
          open: true,
          message: "Este trabajo ya ha sido agregado al formulario",
          severity: "error",
        });
      } else {
        setValue("trabajosRealizados", [...currentTrabajos, newTrabajo]);

        resetFields();
        setSnackbar({
          open: true,
          message: "Trabajo agregado correctamente",
          severity: "success",
        });
      }
    }
  };

  const handleEditTrabajo = (trabajo: any) => {
    setTipoTrabajo(trabajo.manoDeObra.id ? "lista" : "otros");
    if (trabajo.manoDeObra.id) {
      setSelectedTrabajo(trabajo.manoDeObra);
    } else {
      setNombreTrabajo(trabajo.manoDeObra.name);
    }
    setPrecioUnitario(trabajo.precioUnitario.toString());
    setDiasParaRecordatorio(trabajo.diasParaRecordatorio?.toString() || "");

    setEditingTrabajoId(
      trabajo.id ||
        `${selectedTrabajo?.id || "otros"}-${trabajo.manoDeObra.name}`
    );
    setOpenTrabajoModal(true);
  };

  const handleRemoveTrabajo = (trabajo: any) => {
    const currentTrabajos = getValues("trabajosRealizados") || [];
    const updatedTrabajos = currentTrabajos.filter(
      (t: any) =>
        !(
          t.manoDeObra.name === trabajo.manoDeObra.name &&
          t.precioUnitario === trabajo.precioUnitario &&
          t.diasParaRecordatorio === trabajo.diasParaRecordatorio
        )
    );
    setValue("trabajosRealizados", updatedTrabajos);

    setSnackbar({
      open: true,
      message: `${trabajo.manoDeObra.name} eliminado`,
      severity: "info",
    });
  };

  const resetFields = () => {
    setOpenTrabajoModal(false);
    setSelectedTrabajo(null);
    setNombreTrabajo("");
    setPrecioUnitario("");
    setDiasParaRecordatorio("");
    setEditingTrabajoId(null);
  };

  const handleTipoTrabajoChange = (
    _: React.MouseEvent<HTMLElement>,
    newTipoTrabajo: "lista" | "otros" | null
  ) => {
    if (newTipoTrabajo !== null) {
      setTipoTrabajo(newTipoTrabajo);
    }
    if (!editingTrabajoId) {
      resetFields();
      setOpenTrabajoModal(true);
    }
  };

  const openAddModal = () => {
    setEditingTrabajoId(null);
    setOpenTrabajoModal(true);
  };

  return (
    <>
      <Controller
        name="trabajosRealizados"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            {field.value && field.value.length > 0 ? (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "primary.light" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white" }}>Trabajo</TableCell>
                      <TableCell sx={{ color: "white" }}>Precio</TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Días para Recordatorio
                      </TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {field.value.map((trabajo: any) => (
                      <TableRow key={trabajo.id}>
                        <TableCell>
                          <strong>{trabajo.manoDeObra.name}</strong>
                        </TableCell>
                        <TableCell>
                          {getFormattedPrice(trabajo.precioUnitario)}
                        </TableCell>
                        <TableCell>
                          {trabajo.diasParaRecordatorio ? (
                            <Box display="flex" alignItems="center">
                              <EventNoteIcon
                                fontSize="small"
                                sx={{ mr: 0.5, color: "text.secondary" }}
                              />
                              {trabajo.diasParaRecordatorio} días
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin recordatorio
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditTrabajo(trabajo)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveTrabajo(trabajo)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  mb: 2,
                  backgroundColor: "action.hover",
                }}
              >
                <ConstructionIcon
                  sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                />
                <Typography color="textSecondary" gutterBottom>
                  No hay trabajos realizados asignados
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openAddModal}
                  sx={{ mt: 1 }}
                >
                  Agregar Trabajo
                </Button>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
              </Alert>
            )}
            {field.value && field.value.length > 0 && (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  onClick={openAddModal}
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                >
                  Agregar Trabajo
                </Button>
              </Box>
            )}
          </>
        )}
      />

      <Dialog
        open={openTrabajoModal}
        onClose={resetFields}
        PaperProps={{
          style: {
            width: "500px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle>
          {editingTrabajoId ? "Editar" : "Agregar"} Trabajo Realizado
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tipo de Trabajo
            </Typography>
            <ToggleButtonGroup
              value={tipoTrabajo}
              exclusive
              onChange={handleTipoTrabajoChange}
              aria-label="tipo de trabajo"
              fullWidth
              color="primary"
              sx={{ mt: 1 }}
            >
              <ToggleButton value="lista" aria-label="trabajo de lista">
                Trabajo de Lista
              </ToggleButton>
              <ToggleButton value="otros" aria-label="otros trabajos">
                Otros Trabajos
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {tipoTrabajo === "lista" ? (
            <Autocomplete
              options={trabajoOptions}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Trabajo"
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar trabajo..."
                />
              )}
              value={selectedTrabajo}
              onChange={(_, newValue) => {
                setSelectedTrabajo(newValue);
                if (newValue) {
                  setPrecioUnitario(newValue.sellPrice.toString());
                } else {
                  setPrecioUnitario("");
                }
              }}
              onInputChange={(_, newInputValue) => {
                searchTrabajos(newInputValue);
              }}
              disabled={!!editingTrabajoId}
              noOptionsText="No se encontraron trabajos"
              loadingText="Buscando..."
              sx={{ mb: 3 }}
            />
          ) : (
            <TextField
              label="Nombre del Trabajo"
              value={nombreTrabajo}
              onChange={(e) => setNombreTrabajo(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              sx={{ mb: 3 }}
            />
          )}

          <TextField
            label="Precio"
            type="number"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <Typography variant="body2" sx={{ mr: 1 }}>
                  $
                </Typography>
              ),
            }}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recordatorio (opcional)
            </Typography>
            <TextField
              label="Días para Recordatorio"
              type="number"
              value={diasParaRecordatorio}
              onChange={(e) => setDiasParaRecordatorio(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="Dejar vacío si no requiere recordatorio"
              InputProps={{
                endAdornment: (
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    días
                  </Typography>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={resetFields}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrUpdateTrabajo}
            disabled={
              (tipoTrabajo === "lista" && !selectedTrabajo) ||
              (tipoTrabajo === "otros" && !nombreTrabajo) ||
              (!esBorrador && !precioUnitario)
            }
            color="primary"
          >
            {editingTrabajoId ? "Guardar Cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={
            snackbar.severity as "success" | "error" | "warning" | "info"
          }
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TrabajosRealizadosFormSection;
