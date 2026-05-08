"use client";

import ChequePicker from "@/components/cheques/ChequePicker";
import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useFetch } from "@/contexts/FetchContext";
import useCategoriasGasto from "@/hooks/useCategoriasGasto";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useMecanicoAutocomplete from "@/hooks/useMecanicoAutocomplete";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { CHEQUE_OPERACION_IDS } from "@/utils/chequeUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  nombre: yup.string().required("El nombre es requerido"),
  precio: yup
    .number()
    .typeError("El monto debe ser un número")
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup
    .string()
    .oneOf(["Peso", "Dolar"])
    .required("La moneda es requerida"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (s) =>
      s
        .typeError("La cotización debe ser un número")
        .required("La cotización es requerida"),
    otherwise: (s) => s.notRequired(),
  }),
  fecha: yup.date().required("La fecha es requerida"),
  detalle: yup.string().required("El detalle es requerido"),
  categoriaId: yup.number().required("La categoría es requerida"),
  mecanicoId: yup
    .number()
    .nullable()
    .when("categoriaId", {
      is: 2,
      then: (s) => s.required("El empleado es requerido"),
      otherwise: (s) => s.nullable(),
    }),
  proveedorId: yup
    .number()
    .nullable()
    .when("categoriaId", {
      is: 1,
      then: (s) => s.required("El proveedor es requerido"),
      otherwise: (s) => s.nullable(),
    }),
  chequeId: yup
    .number()
    .nullable()
    .when("tipoOperacionId", {
      is: (value: number) => CHEQUE_OPERACION_IDS.includes(value),
      then: (s) =>
        s
          .typeError("Debe seleccionar o crear un cheque")
          .required("Debe seleccionar o crear un cheque"),
      otherwise: (s) => s.nullable().notRequired(),
    }),
  gastosBancarios: yup.number().default(0),
  gastosArba: yup.number().default(0),
});

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="overline"
    sx={{
      color: "text.secondary",
      letterSpacing: 1,
      fontWeight: 600,
    }}
  >
    {children}
  </Typography>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 2,
      "& > *": { flex: 1, minWidth: 0 },
    }}
  >
    {children}
  </Box>
);

type Props = {
  mode?: "create" | "edit";
  id?: number;
  initialValues?: Record<string, any>;
};

const GastoForm = ({ mode = "create", id, initialValues }: Props) => {
  const router = useRouter();
  const { authFetch } = useFetch();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("gasto");
  const { categorias } = useCategoriasGasto();
  const { searchProveedores, initialProveedor } = useProveedorAutocomplete();
  const { searchMecanicos, initialMecanico } = useMecanicoAutocomplete();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isEdit = mode === "edit";

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      moneda: "Peso",
      fecha: new Date(),
      gastosBancarios: 0,
      gastosArba: 0,
      chequeId: null,
      mecanicoId: null,
      proveedorId: null,
      ...(initialValues ?? {}),
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const operacionValue = watch("tipoOperacionId") as number | undefined;
  const categoriaId = watch("categoriaId") as number | undefined;
  const requiresCheque =
    typeof operacionValue === "number" &&
    CHEQUE_OPERACION_IDS.includes(operacionValue);

  const onSubmit = async (data: any) => {
    try {
      const url = isEdit ? `/api/gastos/${id}` : "/api/gastos";
      const method = isEdit ? "PUT" : "POST";
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setFeedback({
          type: "error",
          message:
            body?.error ||
            (isEdit
              ? "No se pudieron guardar los cambios"
              : "No se pudo crear el gasto"),
        });
        return;
      }
      setFeedback({
        type: "success",
        message: isEdit
          ? "Gasto actualizado con éxito"
          : "Gasto creado con éxito",
      });
      setTimeout(() => router.push("/dashboard/gastos"), 600);
    } catch {
      setFeedback({
        type: "error",
        message: isEdit
          ? "Error de red al guardar los cambios"
          : "Error de red al crear el gasto",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <SectionTitle>Fecha y categoría</SectionTitle>
            <Row>
              <CustomInputText name="fecha" label="Fecha" type="date" />
              <CustomSelect
                options={categorias}
                name="categoriaId"
                label="Categoría"
              />
            </Row>
            {categoriaId === 2 && (
              <CustomAutocomplete
                name="mecanicoId"
                label="Empleado"
                searchOptions={searchMecanicos}
                initialOptions={initialMecanico}
              />
            )}
            {categoriaId === 1 && (
              <CustomAutocomplete
                name="proveedorId"
                label="Proveedor"
                searchOptions={searchProveedores}
                initialOptions={initialProveedor}
              />
            )}
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <SectionTitle>Detalles del gasto</SectionTitle>
            <CustomSelect
              options={tiposOperacion}
              name="tipoOperacionId"
              label="Tipo de Operación"
            />
            <CustomInputText name="nombre" label="Nombre" />
            <Row>
              <CustomInputText
                name="precio"
                label="Monto"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
              <CustomSelect options={currency} name="moneda" label="Moneda" />
              <CustomInputText
                name="cotizacionDolar"
                label="Cotización"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">1 USD =</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">ARS</InputAdornment>
                  ),
                }}
              />
            </Row>
            <CustomInputText
              name="detalle"
              label="Detalle"
              multiline
              minRows={2}
            />
          </Stack>

          {requiresCheque && (
            <>
              <Divider />
              <Stack spacing={1.5}>
                <SectionTitle>Cheque asociado</SectionTitle>
                <ChequePicker label="Buscar cheque por número, banco o emisor" />
              </Stack>
            </>
          )}

          <Divider />

          <Stack spacing={1.5}>
            <SectionTitle>Cargos bancarios</SectionTitle>
            <Row>
              <CustomInputText
                name="gastosBancarios"
                label="Gastos Bancarios"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
              <CustomInputText
                name="gastosArba"
                label="Gastos ARBA"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Row>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 1 }}
          >
            <Button
              variant="outlined"
              onClick={() => router.push("/dashboard/gastos")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Guardar gasto"}
            </Button>
          </Stack>
        </Stack>

        <Snackbar
          open={!!feedback}
          autoHideDuration={4000}
          onClose={() => setFeedback(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          {feedback ? (
            <Alert
              onClose={() => setFeedback(null)}
              severity={feedback.type}
              variant="filled"
            >
              {feedback.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </form>
    </FormProvider>
  );
};

export default GastoForm;
