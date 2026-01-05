"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import PercentIcon from "@mui/icons-material/Percent";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";
import EditRecargoForm from "./forms/EditRecargoForm";
import { useUpdateRecargo } from "./hooks/useUpdateRecargo";

const schema = yup.object({
  porcentajeRecargo: yup
    .number()
    .transform((value, originalValue) => {
      // Si el valor original es vacío o null, convertir a 0
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return 0;
      }
      return value;
    })
    .min(0, "El porcentaje de recargo no puede ser negativo")
    .max(100, "El porcentaje de recargo no puede ser mayor a 100")
    .typeError("El porcentaje de recargo debe ser un número")
    .default(0),
});

type FormData = yup.InferType<typeof schema>;

function RecargoSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateRecargo, loading } = useUpdateRecargo();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      porcentajeRecargo: orden.porcentajeRecargo ?? 0,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      porcentajeRecargo: orden.porcentajeRecargo ?? 0,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateRecargo(orden.id, {
        porcentajeRecargo: data.porcentajeRecargo ?? 0,
      });

      setOrden(ordenActualizada);

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
          {orden.porcentajeRecargo ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Porcentaje de recargo:</strong>{" "}
                {orden.porcentajeRecargo}%
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
              No se ha aplicado recargo a esta orden
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default RecargoSection;
