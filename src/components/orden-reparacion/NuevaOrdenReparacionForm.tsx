import { useFetch } from "@/contexts/FetchContext";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import MecanicoFormSection from "./MecanicoFormSection";
import ObservacionesEntradaForm from "./ObservacionesEntradaForm";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

const schema = yup.object().shape({
  autoId: yup.string().required("Debe seleccionar un auto"),
  fechaCreacion: yup.string().required("La fecha de creación es requerida"),
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
  observacionesCliente: yup
    .string()
    .required("Debe ingresar las observaciones"),
  estado: yup
    .string()
    .oneOf(["Presupuestado", "EnProgreso", "Aceptado", "Terminado"])
    .required("Debe seleccionar un estado"),
  mecanicos: yup.array().of(
    yup.object().shape({
      id: yup.number().required(),
      name: yup.string().required(),
    })
  ),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      unidadesConsumidas: yup
        .number()
        .positive()
        .integer()
        .required("Las unidades consumidas son requeridas"),
    })
  ),
  trabajosRealizados: yup.array().of(
    yup.object().shape({
      manoDeObra: yup
        .object()
        .shape({
          name: yup.string().required(),
          diasParaRecordatorio: yup.number().positive().integer().nullable(),
        })
        .required("La mano de obra es requerida"),
      precioUnitario: yup
        .number()
        .positive()
        .required("El precio unitario es requerido"),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      proveedor: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El proveedor es requerido"),
    })
  ),
  manoDeObra: yup.number().positive().required("El monto total es requerido"),
  observacionesEntrada: yup.string(),
});

const NuevaOrdenReparacionForm = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { authFetch } = useFetch();

  const [autocompleteOptions, setAutocompleteOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      manoDeObra: 0,
      estado: "Presupuestado",
      fechaCreacion: new Date().toISOString().split("T")[0],
    },
  });
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = methods;

  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizados = useWatch({ control, name: "trabajosRealizados" });
  const router = useRouter();

  useEffect(() => {
    const calcularMontoTotal = () => {
      const totalTrabajos =
        trabajosRealizados?.reduce((sum, t) => sum + t.precioUnitario, 0) || 0;

      return totalTrabajos;
    };

    setValue("manoDeObra", calcularMontoTotal());
  }, [repuestosUsados, reparacionesTerceros, trabajosRealizados, setValue]);

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

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/orden-reparacion", {
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
        router.push("/dashboard/ordenes-reparacion");
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
        message: `Error al realizar la solicitud de creación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Controller
              name="autoId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl fullWidth margin="normal">
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
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={4}>
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
          </Grid>
          <Grid item xs={4}>
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
          </Grid>
          <Grid item xs={4}>
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
                  error={!!errors.fechaEntradaReparacion}
                  helperText={errors.fechaEntradaReparacion?.message as string}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
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
                  error={!!errors.fechaSalidaReparacion}
                  helperText={errors.fechaSalidaReparacion?.message as string}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Estado"
                  fullWidth
                  error={!!errors.estado}
                  helperText={errors.estado?.message as string}
                >
                  {["Presupuestado", "EnProgreso", "Aceptado", "Terminado"].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={12}>
            <ObservacionesEntradaForm />
          </Grid>
          <Grid item xs={12}>
            <MecanicoFormSection />
          </Grid>
          <Grid item xs={12}>
            <RepuestoUsadoFormSection />
          </Grid>
          <Grid item xs={12}>
            <ReparacionesTercerosFormSection />
          </Grid>
          <Grid item xs={12}>
            <TrabajosRealizadosFormSection />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="manoDeObra"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mano de obra Cliente"
                  type="number"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            my: 2,
          }}
        >
          Crear Orden de Reparación
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
};

export default NuevaOrdenReparacionForm;
