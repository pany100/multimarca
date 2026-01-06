"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import BuildIcon from "@mui/icons-material/Build";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "../../ordenes-reparacion/admin/components/CommonOrderCard";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import EditTrabajosARealizarForm from "./forms/EditTrabajosARealizarForm";
import { useUpdateTrabajosARealizar } from "./hooks/useUpdateTrabajosARealizar";

const schema = yup.object({
  detallesDeTrabajo: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function PresupuestoTrabajosARealizar() {
  const { presupuesto, setPresupuesto } = usePresupuestoRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateTrabajosARealizar, loading } = useUpdateTrabajosARealizar();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      detallesDeTrabajo: presupuesto.detallesDeTrabajo || "",
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      detallesDeTrabajo: presupuesto.detallesDeTrabajo || "",
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const presupuestoActualizado = await updateTrabajosARealizar(
        presupuesto.id,
        {
          detallesDeTrabajo: data.detallesDeTrabajo || null,
        }
      );

      setPresupuesto(presupuestoActualizado);

      setSnackbar({
        open: true,
        message: "Trabajos a realizar actualizados correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar los trabajos a realizar",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Trabajos a Realizar"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditTrabajosARealizarForm />}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <BuildIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {presupuesto.detallesDeTrabajo ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", mr: 2 }}
            >
              {presupuesto.detallesDeTrabajo}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              No hay detalles de trabajo registrados
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default PresupuestoTrabajosARealizar;
