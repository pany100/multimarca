import { useFetch } from "@/contexts/FetchContext";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

const schema = yup.object().shape({
  autoId: yup.string().required("Debe seleccionar un auto"),
  observacionesCliente: yup
    .string()
    .required("Debe ingresar las observaciones"),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de venta es requerido"),
        otherwise: () => yup.mixed(),
      }),
      unidadesConsumidas: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup
            .number()
            .positive()
            .integer()
            .required("Las unidades consumidas son requeridas"),
        otherwise: () => yup.mixed(),
      }),
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
      precioUnitario: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio unitario es requerido"),
        otherwise: () => yup.mixed(),
      }),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de venta es requerido"),
        otherwise: () => yup.mixed(),
      }),
      proveedor: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El proveedor es requerido"),
    })
  ),
  manoDeObra: yup.number().required("El monto total es requerido"),
  observacionesEntrada: yup.string(),
  esBorrador: yup.boolean(),
});

const NuevoPresupuestoForm = ({
  templateId,
}: {
  templateId: number | null | undefined;
}) => {
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
      esBorrador: false,
    },
  });
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = methods;

  const esBorrador = watch("esBorrador") || false;

  useEffect(() => {
    const fetchTemplateData = async () => {
      if (templateId) {
        try {
          const response = await authFetch(
            `/api/plantilla-presupuesto/${templateId}`
          );
          if (response.ok) {
            const templateData = await response.json();
            setValue(
              "repuestosUsados",
              templateData.repuestosUsados.map((repuesto: any) => ({
                stock: { id: repuesto.stockId, name: repuesto.stock.name },
                precioCompra: Number(repuesto.precioCompra),
                precioVenta: Number(repuesto.precioVenta),
                unidadesConsumidas: repuesto.unidadesConsumidas,
              }))
            );
            setValue(
              "reparacionesDeTercero",
              templateData.reparacionesDeTercero.map((reparacion: any) => ({
                nombre: reparacion.nombre,
                precioCompra: Number(reparacion.precioCompra),
                precioVenta: Number(reparacion.precioVenta),
                proveedor: {
                  id: reparacion.proveedorId,
                  name: reparacion.proveedor.name,
                },
              }))
            );
            setValue(
              "trabajosRealizados",
              templateData.trabajosRealizados.map((trabajo: any) => ({
                manoDeObra: { name: trabajo.descripcion },
                precioUnitario: Number(trabajo.precioUnitario),
                diasParaRecordatorio: trabajo.diasParaRecordatorio,
              }))
            );
            setValue("manoDeObra", templateData.manoDeObra);
          } else {
            console.error("Error al obtener datos de la plantilla");
          }
        } catch (error) {
          console.error("Error al obtener datos de la plantilla:", error);
        }
      }
    };

    fetchTemplateData();
  }, [templateId, authFetch, setValue]);

  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const manoDeObra = useWatch({ control, name: "manoDeObra" });
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: (repuestosUsados ?? []).map((item) => ({
      precioVenta: Number(item.precioVenta) || 0,
      unidadesConsumidas: Number(item.unidadesConsumidas) || 0,
    })),
    reparacionesDeTercero: (reparacionesTerceros ?? []).map((item) => ({
      precioVenta: Number(item.precioVenta) || 0,
    })),
    manoDeObra: Number(manoDeObra) || 0,
  });

  const router = useRouter();

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
      const endpoint = data.esBorrador
        ? "/api/borradores"
        : "/api/orden-reparacion";
      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.esBorrador
            ? "Borrador guardado con éxito"
            : "Presupuesto creado con éxito",
          severity: "success",
        });
        router.push("/dashboard/presupuestos");
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
          <Grid item xs={6}>
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
            <Controller
              name="esBorrador"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                  }
                  label="Guardar como borrador"
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
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
            <RepuestoUsadoFormSection esBorrador={esBorrador} />
          </Grid>
          <Grid item xs={12}>
            <ReparacionesTercerosFormSection esBorrador={esBorrador} />
          </Grid>
          <Grid item xs={12}>
            <TrabajosRealizadosFormSection esBorrador={esBorrador} />
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
                  fullWidth
                  margin="normal"
                  error={!!errors.manoDeObra}
                  helperText={errors.manoDeObra?.message as string}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Orden de Reparación"
              value={
                isNaN(totalOrdenReparacion)
                  ? "0"
                  : totalOrdenReparacion.toFixed(2)
              }
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{
                backgroundColor: "action.disabledBackground",
                "& .MuiInputBase-input": {
                  color: "text.secondary",
                },
              }}
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
          {esBorrador ? "Guardar Borrador" : "Crear Presupuesto"}
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

export default NuevoPresupuestoForm;
