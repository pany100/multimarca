"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";
import EditNotasInternasForm from "./forms/EditNotasInternasForm";
import { useUpdateNotasInternas } from "./hooks/useUpdateNotasInternas";

const schema = yup.object({
  observacionesOcultas: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

function NotasInternasSection() {
  const { orden, setOrden } = useOrden();
  const { setSnackbar } = useSnackbarContext();
  const { updateNotasInternas, loading } = useUpdateNotasInternas();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      observacionesOcultas: orden.observacionesOcultas || "",
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      observacionesOcultas: orden.observacionesOcultas || "",
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateNotasInternas(orden.id, {
        observacionesOcultas: data.observacionesOcultas || "",
      });

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Notas internas actualizadas correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar las notas internas",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Observaciones Internas"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditNotasInternasForm />}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <StickyNote2Icon sx={{ color: "text.secondary", mt: 0.5 }} />
        <Box flex={1}>
          {orden.observacionesOcultas ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", mr: 2 }}
            >
              {orden.observacionesOcultas}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              No hay notas internas registradas
            </Typography>
          )}
        </Box>
      </Box>
    </CommonOrderCard>
  );
}

export default NotasInternasSection;
