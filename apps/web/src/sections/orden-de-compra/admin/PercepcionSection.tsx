"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { yupResolver } from "@hookform/resolvers/yup";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrdenDeCompraContext } from "./contexts/OrdenDeCompraContext";

const schema = yup.object({
  percepcion: yup
    .number()
    .min(0, "La percepción no puede ser negativa")
    .typeError("Debe ser un número")
    .required("La percepción es requerida"),
});

type FormData = yup.InferType<typeof schema>;

const PercepcionSection = () => {
  const { orden, setOrden } = useOrdenDeCompraContext();
  const { setSnackbar } = useSnackbarContext();
  const { authFetch } = useFetch();

  const percepcionActual = Number(orden.percepcion ?? 0);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      percepcion: percepcionActual,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      percepcion: Number(orden.percepcion ?? 0),
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await authFetch(`/api/orden-de-compra/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percepcion: data.percepcion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar");
      }

      const ordenActualizada = await response.json();
      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Percepción actualizada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar la percepción",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Percepciones Ingresos Brutos"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={false}
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomInputText
              name="percepcion"
              label="Monto de percepción ($)"
              type="number"
            />
          </Grid>
        </Grid>
      }
      maxWidth="sm"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <ReceiptLongIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Percepción
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="medium">
            {getFormattedPrice(percepcionActual)}
          </Typography>
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default PercepcionSection;
