"use client";

import ChequePicker from "@/components/cheques/ChequePicker";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useFetch } from "@/contexts/FetchContext";
import useFixedSelectData from "@/hooks/useFixedSelectData";
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
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import OrdenSearchAutocomplete, {
  OrdenConDeuda,
} from "./OrdenSearchAutocomplete";

const schema = yup.object({
  ordenReparacionId: yup
    .number()
    .required("Debe seleccionar una orden de reparación"),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  monto: yup
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
  descripcion: yup.string().required("La descripción es requerida"),
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
  /** En modo edit, la orden ya asociada (precargada en el autocomplete). */
  initialOrden?: OrdenConDeuda;
};

const PagoReparacionForm = ({
  mode = "create",
  id,
  initialValues,
  initialOrden,
}: Props) => {
  const router = useRouter();
  const { authFetch } = useFetch();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("ingreso");

  const [selectedOrden, setSelectedOrden] = useState<OrdenConDeuda | null>(
    initialOrden ?? null
  );
  const [ordenError, setOrdenError] = useState<string | undefined>();
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
      ...(initialValues ?? {}),
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Si llega initialOrden después del primer render, sincronizamos.
  useEffect(() => {
    if (initialOrden && !selectedOrden) {
      setSelectedOrden(initialOrden);
      setValue("ordenReparacionId", initialOrden.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrden]);

  const operacionValue = watch("tipoOperacionId") as number | undefined;
  const requiresCheque =
    typeof operacionValue === "number" &&
    CHEQUE_OPERACION_IDS.includes(operacionValue);

  const handleOrdenChange = (orden: OrdenConDeuda | null) => {
    setSelectedOrden(orden);
    setOrdenError(undefined);
    if (orden) {
      setValue("ordenReparacionId", orden.id, { shouldValidate: true });
      // Auto-completar el monto solo en create o si el usuario eligió una
      // orden distinta a la inicial en edit.
      const isInitial = isEdit && initialOrden && orden.id === initialOrden.id;
      if (orden.deuda > 0 && !isInitial) {
        setValue("monto", orden.deuda, { shouldValidate: true });
      }
    } else {
      setValue("ordenReparacionId", undefined as any);
      if (!isEdit) setValue("monto", undefined as any);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedOrden) {
      setOrdenError("Debe seleccionar una orden de reparación");
      return;
    }
    try {
      const url = isEdit
        ? `/api/ingresos-reparacion/${id}`
        : "/api/ingresos-reparacion";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...data,
        ordenReparacionId: selectedOrden.id,
        clienteId: selectedOrden.clienteId,
      };
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setFeedback({
          type: "error",
          message:
            body?.error ||
            (isEdit
              ? "No se pudieron guardar los cambios"
              : "No se pudo registrar el pago"),
        });
        return;
      }
      setFeedback({
        type: "success",
        message: isEdit
          ? "Pago actualizado con éxito"
          : "Pago registrado con éxito",
      });
      setTimeout(
        () => router.push("/dashboard/ingresos-reparacion"),
        600
      );
    } catch {
      setFeedback({
        type: "error",
        message: isEdit
          ? "Error de red al guardar los cambios"
          : "Error de red al registrar el pago",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <SectionTitle>Orden de reparación</SectionTitle>
            <OrdenSearchAutocomplete
              value={selectedOrden}
              onChange={handleOrdenChange}
              error={ordenError}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <SectionTitle>Información del pago</SectionTitle>
            <CustomSelect
              options={tiposOperacion}
              name="tipoOperacionId"
              label="Tipo de Operación"
            />
            <Row>
              <CustomInputText
                name="monto"
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
            <Row>
              <CustomInputText name="fecha" label="Fecha" type="date" />
            </Row>
            <CustomInputText
              name="descripcion"
              label="Descripción"
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
              onClick={() => router.push("/dashboard/ingresos-reparacion")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !selectedOrden}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Registrar pago"}
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

export default PagoReparacionForm;
