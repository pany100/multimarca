import { useFetch } from "@/contexts/FetchContext";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularManoDeObra,
  calcularTotalOrdenReparacion,
} from "@/utils/ordenHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import ConstructionIcon from "@mui/icons-material/Construction";
import HandymanIcon from "@mui/icons-material/Handyman";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

import { Box } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import { Button, Link } from "@mui/material";

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
    formState: { errors, isSubmitted },
    control,
    watch,
  } = methods;

  const { searchAutos, initialAuto } = useAutosAutocomplete();

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
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            Información del Vehículo
          </Typography>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={6}
              ref={(el) => registerFieldRef("autoId", el)}
            >
              <CustomAutocompleteInput
                name="autoId"
                label="Vehículo"
                searchOptions={searchAutos}
                initialOptions={initialAuto}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            Observaciones del Cliente
          </Typography>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              ref={(el) => registerFieldRef("observacionesCliente", el)}
            >
              <CustomInputText
                name="observacionesCliente"
                label="Detalles proporcionados por el cliente"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <InventoryIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Repuestos Usados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RepuestoUsadoFormSection esBorrador={esBorrador} />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <HandymanIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Reparación / Repuestos de terceros
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ReparacionesTercerosFormSection esBorrador={esBorrador} />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <ConstructionIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Trabajos Realizados
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TrabajosRealizadosFormSection esBorrador={esBorrador} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" textAlign="right">
                Mano de obra:{" "}
                {isNaN(manoDeObra)
                  ? "0"
                  : getFormattedPrice(manoDeObra.toFixed(2))}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <PaidIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="h2">
              Resumen de Costos
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4} ref={(el) => registerFieldRef("descuento", el)}>
              <CustomInputText
                name="descuento"
                label="Descuento"
                type="number"
              />
            </Grid>

            <Grid
              item
              xs={8}
              ref={(el) => registerFieldRef("descripcionDescuento", el)}
            >
              <CustomInputText
                name="descripcionDescuento"
                label="Descripción del descuento"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 1,
                  backgroundColor: "primary.lighter",
                  borderRadius: 1,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    Total Orden de Reparación
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ${" "}
                    {isNaN(totalOrdenReparacion)
                      ? "0.00"
                      : totalOrdenReparacion.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/dashboard/presupuestos"
          >
            Volver a la lista
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            sx={{
              px: 4,
              py: 1,
            }}
          >
            Actualizar Borrador
          </Button>
        </Box>
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
