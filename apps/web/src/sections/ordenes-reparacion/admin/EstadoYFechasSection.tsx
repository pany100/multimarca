"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Chip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";
import EditEstadoYFechasForm from "./forms/EditEstadoYFechasForm";
import { getEstadoColor, getEstadoLabel } from "./helpers/estadoHelpers";
import { useUpdateOrdenEstadoYFechas } from "./hooks/useUpdateOrdenEstadoYFechas";

const schema = yup.object({
  estado: yup.string().required("El estado es requerido"),
  fechaEntradaReparacion: yup.string().nullable().optional(),
  fechaSalidaReparacion: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

const formatDate = (date: Date | string | null) => {
  if (!date) return "No definida";
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const EstadoYFechasSection = () => {
  const { orden, setOrden } = useOrden();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();
  const { updateOrdenEstadoYFechas, loading } = useUpdateOrdenEstadoYFechas();

  // Form methods para el modal con datos precargados
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      estado: orden.estado,
      fechaEntradaReparacion: orden.fechaEntradaReparacion
        ? new Date(orden.fechaEntradaReparacion).toISOString().split("T")[0]
        : null,
      fechaSalidaReparacion: orden.fechaSalidaReparacion
        ? new Date(orden.fechaSalidaReparacion).toISOString().split("T")[0]
        : null,
    },
  });

  // Handler para el submit del formulario
  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateOrdenEstadoYFechas(orden.id, {
        estado: data.estado,
        fechaEntradaReparacion: data.fechaEntradaReparacion || null,
        fechaSalidaReparacion: data.fechaSalidaReparacion || null,
      });

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Estado y fechas actualizados correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar el estado y fechas",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Estado y Fechas"
      formMethods={methods}
      onSubmit={handleSubmit}
      loading={loading}
      formContent={<EditEstadoYFechasForm />}
    >
      {/* Estado */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FlagIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Estado:
        </Typography>
        <Chip
          label={getEstadoLabel(orden.estado)}
          color={getEstadoColor(orden.estado)}
          size="small"
        />
      </Box>

      {/* Fecha de Entrada a Reparación */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventAvailableIcon
          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Entrada:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(orden.fechaEntradaReparacion)}
        </Typography>
      </Box>

      {/* Fecha de Salida de Reparación */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventBusyIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Salida:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(orden.fechaSalidaReparacion)}
        </Typography>
      </Box>

      {/* Fecha de Creación */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CalendarTodayIcon
          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Creación:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(orden.fechaCreacion)}
        </Typography>
      </Box>
    </CommonOrderCard>
  );
};

export default EstadoYFechasSection;
