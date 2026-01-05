"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import EditRecargoForm from "@/sections/ordenes-reparacion/admin/forms/EditRecargoForm";
import { yupResolver } from "@hookform/resolvers/yup";
import PercentIcon from "@mui/icons-material/Percent";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import { useUpdateRecargoPresupuesto } from "./hooks/useUpdateRecargoPresupuesto";

const schema = yup.object({
  porcentajeRecargo: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .optional(),
});

type FormData = yup.InferType<typeof schema>;

function PresupuestoRecargoSection() {
  const { presupuesto, setPresupuesto } = usePresupuestoRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateRecargo, loading } = useUpdateRecargoPresupuesto();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      porcentajeRecargo:
        presupuesto.porcentajeRecargo && presupuesto.porcentajeRecargo !== 0
          ? presupuesto.porcentajeRecargo
          : null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      porcentajeRecargo:
        presupuesto.porcentajeRecargo && presupuesto.porcentajeRecargo !== 0
          ? presupuesto.porcentajeRecargo
          : null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const presupuestoActualizado = await updateRecargo(presupuesto.id, {
        porcentajeRecargo: data.porcentajeRecargo || null,
      });

      setPresupuesto(presupuestoActualizado);

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
          {presupuesto.porcentajeRecargo ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Porcentaje de recargo:</strong>{" "}
                {presupuesto.porcentajeRecargo}%
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
              No se ha aplicado recargo a este presupuesto
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default PresupuestoRecargoSection;
