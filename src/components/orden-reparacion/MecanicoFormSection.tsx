import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function MecanicoFormSection() {
  const { control, getValues, setValue } = useFormContext();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openMecanicoModal, setOpenMecanicoModal] = useState(false);
  const [detalle, setDetalle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMecanico, setEditedMecanico] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedMecanico, setSelectedMecanico] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [mecanicoOptions, setMecanicoOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const { authFetch } = useFetch();

  const searchMecanicos = async (query: string) => {
    const response = await authFetch(
      `/api/mecanicos?mecanicos=true&query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setMecanicoOptions(
      data.items.map((mecanico: { name: string; id: number }) => ({
        id: mecanico.id,
        name: mecanico.name,
      }))
    );
  };

  const handleEditMecanico = () => {
    if (selectedMecanico) {
      const currentMecanicos = getValues("mecanicos") || [];
      const mecanicoBeingEdited = currentMecanicos.find(
        (m: { id: number }) => m.id === selectedMecanico.id
      );
      if (!mecanicoBeingEdited) {
        handleAddMecanico();

        if (editedMecanico) {
          handleRemoveMecanico(editedMecanico.id);
        }
      } else {
        mecanicoBeingEdited.detalle = detalle;
        setValue("mecanicos", currentMecanicos);
        setOpenMecanicoModal(false);
        setSelectedMecanico(null);
        setDetalle("");
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: "Mecánico actualizado correctamente",
          severity: "success",
        });
      }
    }
    setEditedMecanico(null);
  };

  const handleAddMecanico = () => {
    if (selectedMecanico) {
      const currentMecanicos = getValues("mecanicos") || [];
      if (
        !currentMecanicos.some(
          (m: { id: number }) => m.id === selectedMecanico.id
        )
      ) {
        setValue("mecanicos", [
          ...currentMecanicos,
          { id: selectedMecanico.id, name: selectedMecanico.name, detalle },
        ]);
        setOpenMecanicoModal(false);
        setSelectedMecanico(null);
        setDetalle("");
        setSnackbar({
          open: true,
          message: "Mecánico agregado correctamente",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Este mecánico ya ha sido agregado",
          severity: "warning",
        });
      }
    }
  };

  const handleRemoveMecanico = (id: number) => {
    const currentMecanicos = getValues("mecanicos") || [];
    const mecanicoToRemove = currentMecanicos.find(
      (m: { id: number }) => m.id === id
    );
    const updatedMecanicos = currentMecanicos.filter(
      (m: { id: number }) => m.id !== id
    );

    setValue("mecanicos", updatedMecanicos);

    setSnackbar({
      open: true,
      message: mecanicoToRemove
        ? `${mecanicoToRemove.name} eliminado`
        : "Mecánico eliminado",
      severity: "info",
    });
  };

  const resetModal = () => {
    setOpenMecanicoModal(false);
    setSelectedMecanico(null);
    setDetalle("");
    setIsEditing(false);
    setEditedMecanico(null);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setOpenMecanicoModal(true);
  };

  return (
    <>
      <Controller
        name="mecanicos"
        control={control}
        rules={{ required: "Debe seleccionar al menos un mecánico" }}
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
                      <TableCell sx={{ color: "white" }}>Mecánico</TableCell>
                      <TableCell sx={{ color: "white" }}>Detalle</TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {field.value.map(
                      (mecanico: {
                        id: number;
                        name: string;
                        detalle: string;
                      }) => (
                        <TableRow key={mecanico.id}>
                          <TableCell>
                            <strong>{mecanico.name}</strong>
                          </TableCell>
                          <TableCell>{mecanico.detalle || "-"}</TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => {
                                  setEditedMecanico(mecanico);
                                  setSelectedMecanico({
                                    id: mecanico.id,
                                    name: mecanico.name,
                                  });
                                  setDetalle(mecanico.detalle || "");
                                  setOpenMecanicoModal(true);
                                  setIsEditing(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  handleRemoveMecanico(mecanico.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    )}
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
                <EngineeringIcon
                  sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                />
                <Typography color="textSecondary" gutterBottom>
                  No hay mecánicos asignados
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={openAddModal}
                  sx={{ mt: 1 }}
                >
                  Agregar Mecánico
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
                  startIcon={<PersonAddIcon />}
                >
                  Agregar Mecánico
                </Button>
              </Box>
            )}
          </>
        )}
      />

      <Dialog
        open={openMecanicoModal}
        onClose={resetModal}
        PaperProps={{
          style: {
            width: "450px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle>
          {isEditing ? "Editar Mecánico" : "Agregar Mecánico"}
        </DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            options={mecanicoOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Mecánico"
                fullWidth
                variant="outlined"
                placeholder="Buscar mecánico..."
              />
            )}
            value={selectedMecanico}
            onChange={(_, newValue) => {
              setSelectedMecanico(newValue);
            }}
            onInputChange={(_, newInputValue) => {
              searchMecanicos(newInputValue);
            }}
            disabled={isEditing}
            noOptionsText="No se encontraron mecánicos"
            loadingText="Buscando..."
            sx={{ mb: 3 }}
          />
          <TextField
            label="Detalle del trabajo"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            multiline
            fullWidth
            rows={3}
            variant="outlined"
            placeholder="Descripción del trabajo a realizar..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={resetModal}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              isEditing ? handleEditMecanico() : handleAddMecanico();
            }}
            disabled={!selectedMecanico}
            color="primary"
          >
            {isEditing ? "Guardar Cambios" : "Agregar"}
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

export default MecanicoFormSection;
