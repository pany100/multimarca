"use client";

import authFetch from "@/utils/authFetch";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  autoId: yup.string().required("Debe seleccionar un auto"),
  fechaCreacion: yup.date().required("La fecha de creación es requerida"),
  fechaEntradaReparacion: yup.date().nullable(),
  fechaSalidaReparacion: yup
    .date()
    .nullable()
    .min(
      yup.ref("fechaEntradaReparacion"),
      "La fecha de salida debe ser posterior a la fecha de entrada"
    ),
  kilometros: yup
    .number()
    .positive()
    .integer()
    .required("Debe ingresar los kilómetros"),
  observacionesCliente: yup.string(),
  estado: yup
    .string()
    .oneOf(["Presupuestado", "En Progreso", "Aceptado", "Terminado"])
    .required("Debe seleccionar un estado"),
  mecanicos: yup.array(),
});

const NuevaOrdenReparacionForm = () => {
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

  const [autocompleteOptions, setAutocompleteOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const debouncedSearch = debounce(
    async (
      query: string,
      callback: (options: { value: string; label: string }[]) => void
    ) => {
      const response = await authFetch(
        `/api/autos?query=${query}&limit=10&page=0`
      );
      const data = await response.json();

      const opciones = data.items.map(
        (auto: {
          patent: string;
          id: number;
          brand: string;
          model: string;
        }) => ({
          label: `${auto.patent} - ${auto.brand || ""} ${auto.model || ""}`,
          value: auto.id.toString(),
        })
      );
      callback(opciones);
    },
    300
  );

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
      if (!currentMecanicos.some((m) => m.id === selectedMecanico.id)) {
        const updatedMecanicos = [...currentMecanicos, selectedMecanico];
        setValue("mecanicos", updatedMecanicos);
        setOpenMecanicoModal(false);
        setSelectedMecanico(null);
      }
    }
  };

  const handleRemoveMecanico = (id: number) => {
    const currentMecanicos = getValues("mecanicos") || [];
    const updatedMecanicos = currentMecanicos.filter((m) => m.id !== id);

    setValue("mecanicos", updatedMecanicos);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/orden-reparacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación creada con éxito",
          severity: "success",
        });
        // Aquí puedes agregar lógica adicional, como redireccionar
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la orden de reparación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: "Error al realizar la solicitud de creación",
        severity: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="autoId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            options={autocompleteOptions || []}
            getOptionLabel={(option) => option?.label || ""}
            value={
              value
                ? autocompleteOptions.find(
                    (option) => option.value === value
                  ) || null
                : null
            }
            onChange={(_, newValue) => {
              onChange(newValue?.value || null);
            }}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                console.log("Input change", newInputValue);
                debouncedSearch(
                  newInputValue,
                  (options: { value: string; label: string }[]) =>
                    setAutocompleteOptions(options)
                );
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Auto"
                error={!!errors.autoId}
                helperText={errors.autoId?.message as string}
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            loadingText="Buscando..."
            noOptionsText="No se encontraron resultados"
            sx={{
              marginBottom: 2,
            }}
          />
        )}
      />
      <Controller
        name="fechaCreacion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="date"
            label="Fecha de creación"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            value={field.value || ""}
            error={!!errors.fechaCreacion}
            helperText={errors.fechaCreacion?.message as string}
            onChange={(e) => field.onChange(e.target.value || null)}
          />
        )}
      />
      <Controller
        name="fechaEntradaReparacion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="date"
            label="Fecha de entrada"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            error={!!errors.fechaEntradaReparacion}
            helperText={errors.fechaEntradaReparacion?.message as string}
            onChange={(e) => field.onChange(e.target.value || null)}
          />
        )}
      />

      <Controller
        name="fechaSalidaReparacion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="date"
            label="Fecha de salida"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            error={!!errors.fechaSalidaReparacion}
            helperText={errors.fechaSalidaReparacion?.message as string}
            onChange={(e) => field.onChange(e.target.value || null)}
          />
        )}
      />

      <Controller
        name="kilometros"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Kilómetros"
            fullWidth
            margin="normal"
            error={!!errors.kilometros}
            helperText={errors.kilometros?.message as string}
          />
        )}
      />

      <Controller
        name="observacionesCliente"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Observaciones del cliente"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            error={!!errors.observacionesCliente}
            helperText={errors.observacionesCliente?.message as string}
          />
        )}
      />

      <Controller
        name="estado"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Estado"
            fullWidth
            margin="normal"
            error={!!errors.estado}
            helperText={errors.estado?.message as string}
          >
            {["Presupuestado", "En Progreso", "Aceptado", "Terminado"].map(
              (option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              )
            )}
          </TextField>
        )}
      />
      <Controller
        name="mecanicos"
        control={control}
        rules={{ required: "Debe seleccionar al menos un mecánico" }}
        render={({ field, fieldState: { error } }) => (
          <>
            <Button
              onClick={() => setOpenMecanicoModal(true)}
              variant="contained"
              color="secondary"
            >
              Agregar Mecánico
            </Button>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mecánico</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.value?.map((mecanico) => (
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
          <Button onClick={() => setOpenMecanicoModal(false)}>Cancelar</Button>
          <Button onClick={handleAddMecanico} disabled={!selectedMecanico}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Button type="submit" variant="contained" color="primary">
        Crear Orden de Reparación
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </form>
  );
};

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Orden de Reparación
        </Typography>

        <NuevaOrdenReparacionForm />

        <Typography
          variant="body2"
          component="p"
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "primary.main",
          }}
          onClick={() => router.back()}
        >
          Volver a la lista de órdenes
        </Typography>
      </Paper>
    </Box>
  );
};

export default NuevaOrdenReparacionPage;
