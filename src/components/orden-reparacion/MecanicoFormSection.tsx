import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Table,
  TableBody,
  TableCell,
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
    const updatedMecanicos = currentMecanicos.filter(
      (m: { id: number }) => m.id !== id
    );

    setValue("mecanicos", updatedMecanicos);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Mecánicos
      </Typography>
      <Controller
        name="mecanicos"
        control={control}
        rules={{ required: "Debe seleccionar al menos un mecánico" }}
        render={({ field, fieldState: { error } }) => (
          <>
            {field.value && field.value.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mecánico</TableCell>
                    <TableCell>Detalle</TableCell>
                    <TableCell>Acciones</TableCell>
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
                        <TableCell>{mecanico.name}</TableCell>
                        <TableCell>{mecanico.detalle || "-"}</TableCell>
                        <TableCell>
                          <Box
                            display="flex"
                            flexDirection="column"
                            sx={{ textAlign: "left" }}
                          >
                            <Button
                              onClick={() => {
                                handleRemoveMecanico(mecanico.id);
                              }}
                            >
                              Eliminar
                            </Button>
                            <Button
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
                              Editar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <Typography>No hay mecánicos asignados</Typography>
            )}
            {error && <Typography color="error">{error.message}</Typography>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={() => setOpenMecanicoModal(true)}
                variant="contained"
              >
                Agregar Mecánico
              </Button>
            </Box>
          </>
        )}
      />
      <Dialog
        open={openMecanicoModal}
        onClose={() => {
          setOpenMecanicoModal(false);
          setSelectedMecanico(null);
        }}
        PaperProps={{
          style: {
            minWidth: "350px",
          },
        }}
      >
        <DialogTitle>Agregar Mecánico</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={mecanicoOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Mecánico" />}
            value={selectedMecanico}
            onChange={(_, newValue) => {
              setSelectedMecanico(newValue);
            }}
            onInputChange={(_, newInputValue) => {
              searchMecanicos(newInputValue);
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Detalle"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            multiline
            fullWidth
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => {
              setOpenMecanicoModal(false);
              setSelectedMecanico(null);
              setDetalle("");
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              isEditing ? handleEditMecanico() : handleAddMecanico();
            }}
            disabled={!selectedMecanico}
          >
            {isEditing ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Divider sx={{ mt: 2 }} />
    </>
  );
}

export default MecanicoFormSection;
