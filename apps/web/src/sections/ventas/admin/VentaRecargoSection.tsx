"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import EditRecargoForm from "@/sections/ordenes-reparacion/admin/forms/EditRecargoForm";
import { yupResolver } from "@hookform/resolvers/yup";
import PercentIcon from "@mui/icons-material/Percent";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { useVentaRequired } from "./contexts/VentaContext";
import { useUpdateRecargoVenta } from "./hooks/useUpdateRecargoVenta";

const schema = yup.object({
  porcentajeRecargo: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .optional(),
});

type FormData = yup.InferType<typeof schema>;

function VentaRecargoSection() {
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateRecargo, loading } = useUpdateRecargoVenta();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      porcentajeRecargo:
        venta.porcentajeRecargo && venta.porcentajeRecargo !== 0
          ? venta.porcentajeRecargo
          : null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      porcentajeRecargo:
        venta.porcentajeRecargo && venta.porcentajeRecargo !== 0
          ? venta.porcentajeRecargo
          : null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ventaActualizada = await updateRecargo(venta.id, {
        porcentajeRecargo: data.porcentajeRecargo || null,
      });

      setVenta(ventaActualizada);

      setSnackbar({
        open: true,
        message: "Recargo actualizado correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar el recargo",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Recargo"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditRecargoForm />}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <PercentIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {venta.porcentajeRecargo ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Porcentaje de recargo:</strong>{" "}
                {venta.porcentajeRecargo}%
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Recargo aplicado a las reparaciones de terceros y repuestos
                utilizados
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              No se ha aplicado recargo a esta venta
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default VentaRecargoSection;
