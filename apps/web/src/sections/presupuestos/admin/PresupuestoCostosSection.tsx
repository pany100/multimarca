"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import EditCostosForm from "@/sections/ordenes-reparacion/admin/forms/EditCostosForm";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useUpdateCostosPresupuesto } from "./hooks/useUpdateCostosPresupuesto";

const schema = yup.object({
  incrementoInterno: yup.number().nullable().optional(),
  descuento: yup.number().nullable().optional(),
  descripcionDescuento: yup.string().nullable().optional(),
  incremento: yup.number().nullable().optional(),
  descripcionIncremento: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function PresupuestoCostosSection() {
  const { presupuesto, setPresupuesto } = usePresupuestoRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateCostos, loading } = useUpdateCostosPresupuesto();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      incrementoInterno: presupuesto.incrementoInterno || null,
      descuento: presupuesto.descuento || null,
      descripcionDescuento: presupuesto.descripcionDescuento || null,
      incremento: presupuesto.incremento || null,
      descripcionIncremento: presupuesto.descripcionIncremento || null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      incrementoInterno: presupuesto.incrementoInterno || null,
      descuento: presupuesto.descuento || null,
      descripcionDescuento: presupuesto.descripcionDescuento || null,
      incremento: presupuesto.incremento || null,
      descripcionIncremento: presupuesto.descripcionIncremento || null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const presupuestoActualizado = await updateCostos(presupuesto.id, data);

      setPresupuesto(presupuestoActualizado);

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
          {presupuesto.incrementoInterno !== null &&
            presupuesto.incrementoInterno !== undefined && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Incremento Interno:</strong> $
                  {presupuesto.incrementoInterno.toLocaleString("es-AR", {
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
          {presupuesto.descuento !== null &&
            presupuesto.descuento !== undefined && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Descuento:</strong> $
                  {presupuesto.descuento.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                {presupuesto.descripcionDescuento && (
                  <Typography variant="caption" color="text.disabled">
                    {presupuesto.descripcionDescuento}
                  </Typography>
                )}
              </Box>
            )}

          {/* Incremento */}
          {presupuesto.incremento !== null &&
            presupuesto.incremento !== undefined && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Incremento:</strong> $
                  {presupuesto.incremento.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                {presupuesto.descripcionIncremento && (
                  <Typography variant="caption" color="text.disabled">
                    {presupuesto.descripcionIncremento}
                  </Typography>
                )}
              </Box>
            )}

          {/* Mensaje cuando no hay datos */}
          {(presupuesto.incrementoInterno === null ||
            presupuesto.incrementoInterno === undefined) &&
            (presupuesto.descuento === null ||
              presupuesto.descuento === undefined) &&
            (presupuesto.incremento === null ||
              presupuesto.incremento === undefined) && (
              <Typography
                variant="body2"
                color="text.disabled"
                fontStyle="italic"
              >
                No hay costos adicionales configurados
              </Typography>
            )}

          {/* Total del presupuesto */}
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
                Total Presupuesto
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
                {presupuesto.totalAPagar?.toLocaleString("es-AR", {
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

export default PresupuestoCostosSection;
