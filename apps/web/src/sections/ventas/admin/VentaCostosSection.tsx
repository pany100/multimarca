"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { useVentaRequired } from "./contexts/VentaContext";
import EditCostosVentaForm from "./forms/EditCostosVentaForm";
import { useUpdateCostosVenta } from "./hooks/useUpdateCostosVenta";

const formatPrecio = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const schema = yup.object({
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

function VentaCostosSection() {
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateCostos, loading } = useUpdateCostosVenta();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      descuento: venta.descuento ?? null,
      descripcionDescuento: venta.descripcionDescuento ?? null,
      incremento: venta.incremento ?? null,
      descripcionIncremento: venta.descripcionIncremento ?? null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      descuento: venta.descuento ?? null,
      descripcionDescuento: venta.descripcionDescuento ?? null,
      incremento: venta.incremento ?? null,
      descripcionIncremento: venta.descripcionIncremento ?? null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ventaActualizada = await updateCostos(venta.id, data);

      setVenta(ventaActualizada);

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
      formContent={<EditCostosVentaForm />}
      maxWidth="md"
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <AttachMoneyIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Stack spacing={1} flex={1}>
          {/* Total Reparaciones de terceros */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Reparaciones de terceros:</strong> $
              {formatPrecio(venta.totalReparacionesDeTerceros)}
            </Typography>
          </Box>

          {/* Total Repuestos */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Repuestos:</strong> $
              {formatPrecio(venta.totalRepuestos)}
            </Typography>
          </Box>

          {/* Total Mano de obra */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Mano de obra:</strong> $
              {formatPrecio(venta.totalManoDeObra)}
            </Typography>
          </Box>

          {/* Descuento */}
          {venta.descuento !== null && venta.descuento !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Descuento:</strong> $ {formatPrecio(venta.descuento)}
              </Typography>
              {venta.descripcionDescuento && (
                <Typography variant="caption" color="text.disabled">
                  {venta.descripcionDescuento}
                </Typography>
              )}
            </Box>
          )}

          {/* Incremento */}
          {venta.incremento !== null && venta.incremento !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Incremento:</strong> $ {formatPrecio(venta.incremento)}
              </Typography>
              {venta.descripcionIncremento && (
                <Typography variant="caption" color="text.disabled">
                  {venta.descripcionIncremento}
                </Typography>
              )}
            </Box>
          )}

          {/* Mensaje cuando no hay datos */}
          {(venta.descuento === null || venta.descuento === undefined) &&
            (venta.incremento === null || venta.incremento === undefined) && (
              <Typography
                variant="body2"
                color="text.disabled"
                fontStyle="italic"
              >
                No hay costos adicionales configurados
              </Typography>
            )}

          {/* Total de la venta */}
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
                Total Venta
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
                $ {formatPrecio(venta.total)}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </CommonOrderCard>
  );
}

export default VentaCostosSection;
