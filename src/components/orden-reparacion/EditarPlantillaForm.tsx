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
  controlesEnReparacion: yup.array().of(
    yup.object().shape({
      id: yup.number().required("Id es requerido"),
      valor: yup.string(),
    })
  ),
  trabajosRealizados: yup.array().of(
    yup.object().shape({
      manoDeObra: yup
        .object()
        .shape({
          name: yup.string().required(),
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
  manoDeObra: yup
    .number()
    .typeError("La mano de obra debe ser un nmero")
    .required("La mano de obra es requerida"),
});

type PlantillaPresupuesto = {
  id: number;
  nombre: string;
  repuestosUsados: {
    id: number;
    ordenReparacionId: number;
    stockId: number;
    stock: {
      id: number;
      name: string;
    };
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
  reparacionesDeTercero: {
    id: number;
    nombre: string;
    precioCompra: number;
    precioVenta: number;
    proveedorId: number;
    proveedor: {
      id: number;
      name: string;
    };
  }[];
  trabajosRealizados: {
    id: number;
    ordenReparacionId: number;
    descripcion: string;
    precioUnitario: number;
    diasParaRecordatorio?: number;
  }[];
  manoDeObra: number;
};

type Props = {
  plantilla: PlantillaPresupuesto;
};

const EditarOrdenReparacionForm = ({ plantilla }: Props) => {
  const { authFetch } = useFetch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...plantilla,
      manoDeObra: plantilla.manoDeObra,
      trabajosRealizados: plantilla.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
        diasParaRecordatorio: trabajo.diasParaRecordatorio,
      })),
      repuestosUsados: plantilla.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
      })),
      reparacionesDeTercero: plantilla.reparacionesDeTercero.map(
        (reparacion) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedorId,
            name: reparacion.proveedor.name,
          },
        })
      ),
    },
  });
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = methods;

  const onSubmit = async (data: any) => {
    try {
      const response = await authFetch(
        `/api/plantilla-presupuesto/${plantilla.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Plantilla de presupuesto actualizada con éxito",
          severity: "success",
        });
        router.push("/dashboard/plantilla-presupuesto");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message:
            errorData.error ||
            "Error al actualizar la plantilla de presupuesto",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de actualización: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };
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
  });

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
                <>
                  <TextField
                    {...field}
                    label="Mano de obra"
                    type="number"
                    fullWidth
                    margin="normal"
                  />
                  {!!errors.manoDeObra && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.manoDeObra.message}
                    </Alert>
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Orden de Reparación"
              value={Number(totalOrdenReparacion.toFixed(2))}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Actualizar Orden de Reparación
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

export default EditarOrdenReparacionForm;
