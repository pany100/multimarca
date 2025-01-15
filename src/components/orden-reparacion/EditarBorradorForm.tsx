import { useFetch } from "@/contexts/FetchContext";
import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
} from "@/utils/ordenHelper";
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
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

const schema = yup.object().shape({
  autoId: yup.number().required("Debe seleccionar un auto"),
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
  observacionesEntrada: yup.string(),
  descuento: yup.number().min(0),
  esBorrador: yup.boolean(),
});

type Props = {
  borrador: {
    id: number;
    autoId: number;
    auto: {
      id: number;
      patent: string;
      brand?: string;
      model?: string;
    };
    observacionesCliente: string;
    repuestosUsados: {
      stock: {
        id: number;
        name: string;
      };
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
    }[];
    trabajosRealizados: {
      id: number;
      ordenReparacionId: number;
      descripcion: string;
      precioUnitario: number;
      diasParaRecordatorio?: number;
    }[];
    reparacionesDeTercero: {
      nombre: string;
      precioCompra?: number;
      precioVenta?: number;
      proveedor: {
        id: number;
        name: string;
      };
    }[];
    descuento: number;
    observacionesEntrada?: string;
  };
};

const EditarBorradorForm = ({ borrador }: Props) => {
  const { authFetch } = useFetch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [autocompleteOptions, setAutocompleteOptions] = useState<
    { value: string; label: string }[]
  >([
    {
      value: borrador.autoId.toString(),
      label: `${borrador.auto.patent} - ${borrador.auto.brand || ""} ${
        borrador.auto.model || ""
      }`,
    },
  ]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...borrador,
      esBorrador: true,
      descuento: 0,
      trabajosRealizados: borrador.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })),
    },
  });

  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = methods;

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

  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizadosField = useWatch({
    control,
    name: "trabajosRealizados",
  });
  const trabajosRealizados = (trabajosRealizadosField ?? []).map((trabajo) => ({
    precioUnitario: Number(trabajo.precioUnitario) || 0,
  }));
  const manoDeObra = calcularManoDeObra(trabajosRealizados ?? []);

  const descuento = useWatch({ control, name: "descuento" }) || 0;
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: (repuestosUsados ?? []).map((item) => ({
      precioVenta: Number(item.precioVenta) || 0,
      unidadesConsumidas: Number(item.unidadesConsumidas) || 0,
    })),
    reparacionesDeTercero: (reparacionesTerceros ?? []).map((item) => ({
      precioVenta: Number(item.precioVenta) || 0,
    })),
    trabajosRealizados: trabajosRealizados ?? [],
    descuento: Number(descuento) || 0,
  });
  const esBorrador = watch("esBorrador") || false;
  const onSubmit = async (data: any) => {
    try {
      const endpoint = data.esBorrador
        ? `/api/borradores/${borrador.id}`
        : "/api/orden-reparacion";
      const method = data.esBorrador ? "PUT" : "POST";

      const response = await authFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (!data.esBorrador) {
          // Si estamos creando un presupuesto, borramos el borrador
          await authFetch(`/api/borradores/${borrador.id}`, {
            method: "DELETE",
          });
        }

        setSnackbar({
          open: true,
          message: data.esBorrador
            ? "Borrador actualizado con éxito"
            : "Presupuesto creado con éxito",
          severity: "success",
        });

        if (data.esBorrador) {
          router.push("/dashboard/presupuestos");
        } else {
          router.back();
        }
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al procesar la solicitud",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud: ${
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
                    options={autocompleteOptions}
                    getOptionLabel={(option) => option?.label || ""}
                    value={
                      value
                        ? autocompleteOptions.find(
                            (option) => option.value === value.toString()
                          ) || null
                        : null
                    }
                    onChange={(_, newValue) => {
                      onChange(newValue?.value || null);
                    }}
                    onInputChange={(event, newInputValue, reason) => {
                      if (reason === "input") {
                        debouncedSearch(newInputValue, setAutocompleteOptions);
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
              name="descuento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descuento"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.descuento}
                  helperText={errors.descuento?.message as string}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mano de obra"
              value={isNaN(manoDeObra) ? "0" : manoDeObra.toFixed(2)}
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
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {methods.watch("esBorrador")
                ? "Actualizar Borrador"
                : "Crear Presupuesto"}
            </Button>
          </Grid>
        </Grid>
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

export default EditarBorradorForm;
