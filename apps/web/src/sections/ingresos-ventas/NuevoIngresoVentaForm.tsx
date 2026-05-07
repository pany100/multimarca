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
import VentaSearchAutocomplete, {
  VentaConDeuda,
} from "./VentaSearchAutocomplete";

const schema = yup.object({
  ventaId: yup.number().required("Debe seleccionar una venta"),
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  descripcion: yup.string().required("La descripción es requerida"),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotización es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),
  gastosBancarios: yup.number().default(0),
  gastosArba: yup.number().default(0),
  ...getSchemaPropsForCheque("tipoOperacionId"),
});

export default function NuevoIngresoVentaForm() {
  const router = useRouter();
  const { authFetch } = useFetch();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("ingreso");

  const [selectedVenta, setSelectedVenta] = useState<VentaConDeuda | null>(
    null
  );
  const [ventaError, setVentaError] = useState<string | undefined>();
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

  const handleVentaChange = (venta: VentaConDeuda | null) => {
    setSelectedVenta(venta);
    setVentaError(undefined);
    if (venta) {
      setValue("ventaId", venta.id);
      if (venta.deuda > 0) {
        setValue("monto", venta.deuda);
      }
    } else {
      setValue("ventaId", undefined as any);
      setValue("monto", undefined as any);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedVenta) {
      setVentaError("Debe seleccionar una venta");
      return;
    }

    try {
      const response = await authFetch("/api/ingresos-ventas", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ventaId: selectedVenta.id,
        }),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Pago registrado con éxito",
        });
        setTimeout(() => {
          router.push("/dashboard/ingresos-ventas");
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
        {/* PASO 1: Selección de venta */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          1. Seleccionar venta
        </Typography>
        <VentaSearchAutocomplete
          value={selectedVenta}
          onChange={handleVentaChange}
          error={ventaError}
        />

        {/* PASO 2: Datos del pago — solo visible si hay venta seleccionada */}
        {selectedVenta && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              2. Datos del pago
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <CustomInputText name="fecha" label="Fecha" type="date" />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomInputText name="monto" label="Monto" type="number" />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomSelect name="moneda" label="Moneda" options={currency} />
              </Grid>

              {watch("moneda") === "Dolar" && (
                <Grid item xs={12} md={4}>
                  <CustomInputText
                    name="cotizacionDolar"
                    label="Cotización Dolar"
                    type="number"
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <CustomSelect
                  name="tipoOperacionId"
                  label="Tipo de Operación"
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
                  label="Descripción"
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
            onClick={() => router.push("/dashboard/ingresos-ventas")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !selectedVenta}
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
