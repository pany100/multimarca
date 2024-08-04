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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function TrabajosRealizadosFormSection() {
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
            diasParaRecordatorio: diasParaRecordatorio
              ? Number(diasParaRecordatorio)
              : "-",
          }
        : {
            manoDeObra: { name: nombreTrabajo },
            precioUnitario: Number(precioUnitario),
            diasParaRecordatorio: diasParaRecordatorio
              ? Number(diasParaRecordatorio)
              : "-",
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

      // Sumar el precio unitario al campo manoObra del formulario
      const currentManoObra = Number(getValues("manoDeObra")) || 0;
      setValue("manoDeObra", currentManoObra + Number(precioUnitario));

      setOpenTrabajoModal(false);
      resetFields();
      setSnackbar({
        open: true,
        message: "Trabajo agregado correctamente",
        severity: "success",
      });
    }
  };

  const handleRemoveTrabajo = (index: number) => {
    const currentTrabajos = getValues("trabajosRealizados") || [];
    const trabajoARemover = currentTrabajos[index];
    const currentManoObra = Number(getValues("manoDeObra")) || 0;
    const precioARestar = Number(trabajoARemover.precioUnitario);

    const updatedTrabajos = currentTrabajos.filter(
      (_: any, i: number) => i !== index
    );

    setValue("trabajosRealizados", updatedTrabajos);
    setValue("manoDeObra", Math.max(0, currentManoObra - precioARestar));
  };

  const resetFields = () => {
    setSelectedTrabajo(null);
    setNombreTrabajo("");
    setPrecioUnitario("");
    setDiasParaRecordatorio("");
  };

  const handleTipoTrabajoChange = (
    _: React.MouseEvent<HTMLElement>,
    newTipoTrabajo: "lista" | "otros" | null
  ) => {
    if (newTipoTrabajo !== null) {
      setTipoTrabajo(newTipoTrabajo);
      resetFields();
    }
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
            {field.value && field.value.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Trabajo</TableCell>
                    <TableCell>Precio sugerido</TableCell>
                    <TableCell>Días para Recordatorio</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.value.map((trabajo: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{trabajo.manoDeObra.name}</TableCell>
                      <TableCell>{trabajo.precioUnitario}</TableCell>
                      <TableCell>
                        {trabajo.diasParaRecordatorio || "-"}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleRemoveTrabajo(index)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No hay trabajos realizados asignados</Typography>
            )}
            {error && <Typography color="error">{error.message}</Typography>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={() => setOpenTrabajoModal(true)}
                variant="contained"
              >
                Agregar Trabajo
              </Button>
            </Box>
          </>
        )}
      />
      <Dialog
        open={openTrabajoModal}
        onClose={() => {
          setOpenTrabajoModal(false);
          resetFields();
        }}
        PaperProps={{
          style: {
            width: "450px",
          },
        }}
      >
        <DialogTitle>Agregar Trabajo Realizado</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            value={tipoTrabajo}
            exclusive
            onChange={handleTipoTrabajoChange}
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
              sx={{ mt: 2 }}
            />
          ) : (
            <TextField
              label="Nombre del Trabajo"
              value={nombreTrabajo}
              onChange={(e) => setNombreTrabajo(e.target.value)}
              fullWidth
              margin="normal"
              sx={{ mt: 2 }}
            />
          )}
          <TextField
            label="Precio Unitario Sugerido"
            type="number"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Días para Recordatorio"
            type="number"
            value={diasParaRecordatorio}
            onChange={(e) => setDiasParaRecordatorio(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => {
              setOpenTrabajoModal(false);
              resetFields();
            }}
          >
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
      <Divider sx={{ mt: 2 }} />
    </>
  );
}

export default TrabajosRealizadosFormSection;
