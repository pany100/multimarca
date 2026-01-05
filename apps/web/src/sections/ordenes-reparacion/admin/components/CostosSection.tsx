"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useOrden } from "../contexts/OrdenContext";
import EditCostosForm from "../forms/EditCostosForm";
import { useUpdateCostos } from "../hooks/useUpdateCostos";
import { CommonOrderCard } from "./CommonOrderCard";

const schema = yup.object({
  incrementoInterno: yup
    .number()
    .nullable()
    .min(0, "El incremento interno no puede ser negativo")
    .typeError("El incremento interno debe ser un número")
    .optional(),
  descuento: yup
    .number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .typeError("El descuento debe ser un número")
    .optional(),
  descripcionDescuento: yup.string().nullable().optional(),
  incremento: yup
    .number()
    .nullable()
    .min(0, "El incremento no puede ser negativo")
    .typeError("El incremento debe ser un número")
    .optional(),
  descripcionIncremento: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function CostosSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateCostos, loading } = useUpdateCostos();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      incrementoInterno: orden.incrementoInterno ?? null,
      descuento: orden.descuento ?? null,
      descripcionDescuento: orden.descripcionDescuento ?? null,
      incremento: orden.incremento ?? null,
      descripcionIncremento: orden.descripcionIncremento ?? null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      incrementoInterno: orden.incrementoInterno ?? null,
      descuento: orden.descuento ?? null,
      descripcionDescuento: orden.descripcionDescuento ?? null,
      incremento: orden.incremento ?? null,
      descripcionIncremento: orden.descripcionIncremento ?? null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateCostos(orden.id, data);

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Costos actualizados correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar los costos",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Costos"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditCostosForm />}
      maxWidth="md"
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <AttachMoneyIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Stack spacing={1} flex={1}>
          {/* Incremento Interno */}
          {orden.incrementoInterno !== null &&
            orden.incrementoInterno !== undefined && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Incremento Interno:</strong> $
                  {orden.incrementoInterno.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontStyle="italic"
                >
                  Este incremento va a mostrarse como parte de la mano de obra
                  cuando se imprima el informe al cliente
                </Typography>
              </Box>
            )}

          {/* Descuento */}
          {orden.descuento !== null && orden.descuento !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Descuento:</strong> $
                {orden.descuento.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
              {orden.descripcionDescuento && (
                <Typography variant="caption" color="text.disabled">
                  {orden.descripcionDescuento}
                </Typography>
              )}
            </Box>
          )}

          {/* Incremento */}
          {orden.incremento !== null && orden.incremento !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Incremento:</strong> $
                {orden.incremento.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
              {orden.descripcionIncremento && (
                <Typography variant="caption" color="text.disabled">
                  {orden.descripcionIncremento}
                </Typography>
              )}
            </Box>
          )}

          {/* Mensaje cuando no hay datos */}
          {(orden.incrementoInterno === null ||
            orden.incrementoInterno === undefined) &&
            (orden.descuento === null || orden.descuento === undefined) &&
            (orden.incremento === null || orden.incremento === undefined) && (
              <Typography
                variant="body2"
                color="text.disabled"
                fontStyle="italic"
              >
                No hay costos adicionales configurados
              </Typography>
            )}

          {/* Total de la orden */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              backgroundColor: "primary.lighter",
              borderRadius: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold" color="primary.dark">
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
                {orden.total?.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </CommonOrderCard>
  );
}

export default CostosSection;
