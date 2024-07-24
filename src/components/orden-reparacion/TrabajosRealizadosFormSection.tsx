import authFetch from "@/utils/authFetch";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function TrabajosRealizadosFormSection() {
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
  const [tipoTrabajo, setTipoTrabajo] = useState<"lista" | "otros">("lista");

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

  const handleAddTrabajo = () => {
    const currentTrabajos = getValues("trabajosRealizados") || [];
    const newTrabajo =
      tipoTrabajo === "lista"
        ? {
            manoDeObra: selectedTrabajo,
            precioUnitario: Number(precioUnitario),
          }
        : {
            manoDeObra: { name: nombreTrabajo },
            precioUnitario: Number(precioUnitario),
          };

    if (
      currentTrabajos.some(
        (t: any) =>
          (tipoTrabajo === "lista" &&
            t.manoDeObra.id === selectedTrabajo?.id) ||
          (tipoTrabajo === "otros" && t.manoDeObra.name === nombreTrabajo)
      )
    ) {
      setSnackbar({
        open: true,
        message: "Este trabajo ya ha sido agregado al formulario",
        severity: "error",
      });
    } else {
      setValue("trabajosRealizados", [...currentTrabajos, newTrabajo]);
      setOpenTrabajoModal(false);
      setSelectedTrabajo(null);
      setNombreTrabajo("");
      setPrecioUnitario("");
      setSnackbar({
        open: true,
        message: "Trabajo agregado correctamente",
        severity: "success",
      });
    }
  };

  const handleRemoveTrabajo = (index: number) => {
    const currentTrabajos = getValues("trabajosRealizados") || [];
    const updatedTrabajos = currentTrabajos.filter(
      (_: any, i: number) => i !== index
    );

    setValue("trabajosRealizados", updatedTrabajos);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Trabajos Realizados
      </Typography>
      <Controller
        name="trabajosRealizados"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Trabajo</TableCell>
                  <TableCell>Precio Unitario</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.value?.map((trabajo: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{trabajo.manoDeObra.name}</TableCell>
                    <TableCell>{trabajo.precioUnitario}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleRemoveTrabajo(index)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {error && <Typography color="error">{error.message}</Typography>}
            <Button
              onClick={() => setOpenTrabajoModal(true)}
              variant="contained"
              color="secondary"
            >
              Agregar Trabajo
            </Button>
          </>
        )}
      />
      <Dialog
        open={openTrabajoModal}
        onClose={() => setOpenTrabajoModal(false)}
      >
        <DialogTitle>Agregar Trabajo Realizado</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            value={tipoTrabajo}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setTipoTrabajo(newValue);
                setSelectedTrabajo(null);
                setNombreTrabajo("");
                setPrecioUnitario("");
              }
            }}
            aria-label="tipo de trabajo"
          >
            <ToggleButton value="lista" aria-label="trabajo de lista">
              Trabajo de Lista
            </ToggleButton>
            <ToggleButton value="otros" aria-label="otros trabajos">
              Otros Trabajos
            </ToggleButton>
          </ToggleButtonGroup>
          {tipoTrabajo === "lista" ? (
            <Autocomplete
              options={trabajoOptions}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Trabajo" />
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
            />
          ) : (
            <TextField
              label="Nombre del Trabajo"
              value={nombreTrabajo}
              onChange={(e) => setNombreTrabajo(e.target.value)}
              fullWidth
              margin="normal"
            />
          )}
          <TextField
            label="Precio Unitario"
            type="number"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpenTrabajoModal(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddTrabajo}
            disabled={
              (tipoTrabajo === "lista" && !selectedTrabajo) ||
              (tipoTrabajo === "otros" && !nombreTrabajo) ||
              !precioUnitario
            }
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
        <Alert severity={snackbar.severity as "success" | "error" | "warning"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TrabajosRealizadosFormSection;
