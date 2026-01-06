"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Divider, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ClienteInfo } from "./components/ClienteInfo";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { EstadoYFechasInfo } from "./components/EstadoYFechasInfo";
import { ObservacionesClienteInfo } from "./components/ObservacionesClienteInfo";
import { VehiculoInfo } from "./components/VehiculoInfo";
import { useOrden } from "./contexts/OrdenContext";
import EditInformacionGeneralForm from "./forms/EditInformacionGeneralForm";
import { useUpdateOrdenGeneralInfo } from "./hooks/useUpdateOrdenGeneralInfo";

const schema = yup.object({
  autoId: yup.number().required("El vehículo es requerido"),
  kilometros: yup.number().nullable().optional(),
  estado: yup.string().required("El estado es requerido"),
  fechaEntradaReparacion: yup.string().nullable().optional(),
  fechaSalidaReparacion: yup.string().nullable().optional(),
  observacionesCliente: yup
    .string()
    .required("Las observaciones son requeridas"),
});

type FormData = yup.InferType<typeof schema>;

const InformacionGeneralSection = () => {
  const { orden, setOrden } = useOrden();
  const router = useRouter();
  const { setSnackbar } = useSnackbarContext();
  const { updateOrdenGeneralInfo, loading } = useUpdateOrdenGeneralInfo();

  // Form methods para el modal con datos precargados
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      autoId: orden.autoId,
      kilometros: orden.kilometros,
      estado: orden.estado,
      fechaEntradaReparacion: orden.fechaEntradaReparacion
        ? orden.fechaEntradaReparacion.toString().split("T")[0]
        : null,
      fechaSalidaReparacion: orden.fechaSalidaReparacion
        ? orden.fechaSalidaReparacion.toString().split("T")[0]
        : null,
      observacionesCliente: orden.observacionesCliente,
    },
  });

  // Handler para resetear el formulario con los valores actuales de la orden
  const handleOpenModal = () => {
    methods.reset({
      autoId: orden.autoId,
      kilometros: orden.kilometros,
      estado: orden.estado,
      fechaEntradaReparacion: orden.fechaEntradaReparacion
        ? orden.fechaEntradaReparacion.toString().split("T")[0]
        : null,
      fechaSalidaReparacion: orden.fechaSalidaReparacion
        ? orden.fechaSalidaReparacion.toString().split("T")[0]
        : null,
      observacionesCliente: orden.observacionesCliente,
    });
  };

  // Handler para el submit del formulario
  const handleSubmit = async (data: FormData) => {
    try {
      const ordenActualizada = await updateOrdenGeneralInfo(orden.id, {
        autoId: data.autoId,
        kilometros: data.kilometros,
        estado: data.estado,
        fechaEntradaReparacion: data.fechaEntradaReparacion || null,
        fechaSalidaReparacion: data.fechaSalidaReparacion || null,
        observacionesCliente: data.observacionesCliente,
      });

      setOrden(ordenActualizada);

      setSnackbar({
        open: true,
        message: "Información actualizada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar la información",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Información General"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      formContent={<EditInformacionGeneralForm />}
    >
      {/* Primera fila: Cliente (izq) / Vehículo (der) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ClienteInfo cliente={orden.auto?.owner} />
        </Grid>
        <Grid item xs={12} md={6}>
          <VehiculoInfo vehiculo={orden.auto} kilometros={orden.kilometros} />
        </Grid>
      </Grid>

      {/* Separador */}
      <Divider sx={{ my: 3, borderColor: "divider" }} />

      {/* Segunda fila: Estado y Fechas (izq) / Observaciones (der) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <EstadoYFechasInfo
            estado={orden.estado}
            fechaEntradaReparacion={orden.fechaEntradaReparacion}
            fechaSalidaReparacion={orden.fechaSalidaReparacion}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ObservacionesClienteInfo
            observaciones={orden.observacionesCliente}
          />
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default InformacionGeneralSection;
