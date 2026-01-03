"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";
import EditRevisionForm from "./forms/EditRevisionForm";
import { useUpdateRevision } from "./hooks/useUpdateRevision";

const schema = yup.object({
  revisadoPorId: yup.number().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function RevisionSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateRevision, loading } = useUpdateRevision();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      revisadoPorId: orden.revisadoPorId || null,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      revisadoPorId: orden.revisadoPorId || null,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateRevision(orden.id, {
        revisadoPorId: data.revisadoPorId || null,
      });

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Revisión actualizada correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar la revisión",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Revisión de Calidad"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditRevisionForm />}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <VerifiedUserIcon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {orden.revisadoPor ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Revisado por:</strong> {orden.revisadoPor.fullName}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              Esta orden no ha sido revisada
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default RevisionSection;
