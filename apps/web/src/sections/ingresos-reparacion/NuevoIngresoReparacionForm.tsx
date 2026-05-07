"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useFetch } from "@/contexts/FetchContext";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import {
  CHEQUE_OPERACION_IDS,
  getSchemaPropsForCheque,
} from "@/utils/chequeUtils";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import OrdenSearchAutocomplete, {
  OrdenConDeuda,
} from "./OrdenSearchAutocomplete";

const schema = yup.object({
  ordenReparacionId: yup
    .number()
    .required("Debe seleccionar una orden de reparacion"),
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  descripcion: yup.string().required("La descripcion es requerida"),
  tipoOperacionId: yup.number().required("El tipo de operacion es requerido"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotizacion es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),
  gastosBancarios: yup.number().default(0),
  gastosArba: yup.number().default(0),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

export default function NuevoIngresoReparacionForm() {
  const router = useRouter();
  const { authFetch } = useFetch();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("ingreso");

  const [selectedOrden, setSelectedOrden] = useState<OrdenConDeuda | null>(
    null
  );
  const [ordenError, setOrdenError] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: new Date(),
      moneda: "Peso",
      gastosBancarios: 0,
      gastosArba: 0,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const operacionValue = watch("tipoOperacionId");

  const handleOrdenChange = (orden: OrdenConDeuda | null) => {
    setSelectedOrden(orden);
    setOrdenError(undefined);
    if (orden) {
      setValue("ordenReparacionId", orden.id);
      if (orden.deuda > 0) {
        setValue("monto", orden.deuda);
      }
    } else {
      setValue("ordenReparacionId", undefined as any);
      setValue("monto", undefined as any);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedOrden) {
      setOrdenError("Debe seleccionar una orden de reparacion");
      return;
    }

    try {
      const response = await authFetch("/api/ingresos-reparacion", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ordenReparacionId: selectedOrden.id,
          clienteId: selectedOrden.clienteId,
        }),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Pago registrado con exito",
        });
        setTimeout(() => {
          router.push("/dashboard/ingresos-reparacion");
        }, 1500);
      } else {
        const errorData = await response.json();
        setFeedback({
          type: "error",
          message: `Error al registrar el pago: ${errorData.error}`,
        });
      }
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      setFeedback({
        type: "error",
        message: "Error al realizar la solicitud",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* PASO 1: Seleccion de orden */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          1. Seleccionar orden de reparacion
        </Typography>
        <OrdenSearchAutocomplete
          value={selectedOrden}
          onChange={handleOrdenChange}
          error={ordenError}
        />

        {/* PASO 2: Datos del pago — solo visible si hay orden seleccionada */}
        {selectedOrden && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              2. Datos del pago
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CustomInputText name="fecha" label="Fecha" type="date" />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomInputText name="monto" label="Monto" type="number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomSelect name="moneda" label="Moneda" options={currency} />
              </Grid>

              {watch("moneda") === "Dolar" && (
                <Grid item xs={12} md={6}>
                  <CustomInputText
                    name="cotizacionDolar"
                    label="Cotizacion Dolar"
                    type="number"
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <CustomSelect
                  name="tipoOperacionId"
                  label="Tipo de Operacion"
                  options={tiposOperacion}
                />
              </Grid>

              {CHEQUE_OPERACION_IDS.includes(operacionValue) && (
                <Grid item xs={12}>
                  <ChequeData />
                </Grid>
              )}

              <Grid item xs={12}>
                <Accordion
                  sx={{
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" color="text.secondary">
                      Gastos adicionales
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <CustomInputText
                          name="gastosBancarios"
                          label="Gastos Bancarios (en pesos)"
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <CustomInputText
                          name="gastosArba"
                          label="Gastos ARBA (en pesos)"
                          type="number"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <CustomInputText
                  name="descripcion"
                  label="Descripcion"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Acciones */}
        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
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
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Registrar Pago"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={!!feedback}
        autoHideDuration={6000}
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
    </FormProvider>
  );
}
