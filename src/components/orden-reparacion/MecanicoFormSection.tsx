import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const { authFetch } = useFetch();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openMecanicoModal, setOpenMecanicoModal] = useState(false);
  const [selectedMecanico, setSelectedMecanico] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [mecanicoOptions, setMecanicoOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const searchMecanicos = async (query: string) => {
    const response = await authFetch(
      `/api/mecanicos?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setMecanicoOptions(
      data.items.map((mecanico: { name: string; id: number }) => ({
        id: mecanico.id,
        name: mecanico.name,
      }))
    );
  };

  const handleAddMecanico = () => {
    if (selectedMecanico) {
      const currentMecanicos = getValues("mecanicos") || [];
      if (
        !currentMecanicos.some(
          (m: { id: number }) => m.id === selectedMecanico.id
        )
      ) {
        setValue("mecanicos", [...currentMecanicos, selectedMecanico]);
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mecánico</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.value?.map((mecanico: { id: number; name: string }) => (
                  <TableRow key={mecanico.id}>
                    <TableCell>{mecanico.name}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          handleRemoveMecanico(mecanico.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {error && <Typography color="error">{error.message}</Typography>}
            <Button
              onClick={() => setOpenMecanicoModal(true)}
              variant="contained"
              color="secondary"
            >
              Agregar Mecánico
            </Button>
          </>
        )}
      />
      <Dialog
        open={openMecanicoModal}
        onClose={() => setOpenMecanicoModal(false)}
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
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpenMecanicoModal(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddMecanico}
            disabled={!selectedMecanico}
          >
            Agregar
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
    </>
  );
}

export default MecanicoFormSection;
