import { useFetch } from "@/contexts/FetchContext";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Grid, Snackbar, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

const schema = yup.object().shape({
  nombre: yup.string().required("Debe ingresar un nombre"),
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
  manoDeObra: yup.number().required("El monto total es requerido"),
});

const NuevaPlantillaForm = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { authFetch } = useFetch();

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      manoDeObra: 0,
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
  const manoDeObra = useWatch({ control, name: "manoDeObra" });
  const totalOrdenReparacion = calcularTotalOrdenReparacion({
    repuestosUsados: repuestosUsados ?? [],
    reparacionesDeTercero: reparacionesTerceros ?? [],
    manoDeObra,
    descuento: 0,
  });

  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch("/api/plantilla-presupuesto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Plantilla creada con éxito",
          severity: "success",
        });
        router.push("/dashboard/plantilla-presupuesto");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear la plantilla",
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
          <Grid item xs={12}>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre de la plantilla"
                  fullWidth
                  margin="normal"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message as string}
                />
              )}
            />
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
          Crear Plantilla
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

export default NuevaPlantillaForm;
