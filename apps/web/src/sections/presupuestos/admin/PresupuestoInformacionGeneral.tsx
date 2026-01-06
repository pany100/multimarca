"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { yupResolver } from "@hookform/resolvers/yup";
import { Divider, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ClienteInfoPresupuesto } from "./components/ClienteInfoPresupuesto";
import { EstadoYFechasInfoPresupuesto } from "./components/EstadoYFechasInfoPresupuesto";
import { PedidoClienteInfo } from "./components/PedidoClienteInfo";
import { VehiculoInfoPresupuesto } from "./components/VehiculoInfoPresupuesto";
import { usePresupuestoRequired } from "./contexts/PresupuestoContext";
import EditInformacionGeneralPresupuestoForm from "./forms/EditInformacionGeneralPresupuestoForm";
import { useUpdatePresupuestoGeneralInfo } from "./hooks/useUpdatePresupuestoGeneralInfo";

const schema = yup.object({
  autoId: yup
    .number()
    .nullable()
    .optional()
    .test(
      "auto-or-info-required",
      "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      function (value) {
        const { informacionAuto } = this.parent;
        return !!value || !!informacionAuto;
      }
    ),
  informacionAuto: yup
    .string()
    .nullable()
    .optional()
    .test(
      "auto-or-info-required",
      "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      function (value) {
        const { autoId } = this.parent;
        return !!autoId || !!value;
      }
    ),
  informacionCliente: yup.string().nullable().optional(),
  estado: yup.string().required("El estado es requerido"),
  fechaEnvio: yup.string().nullable().optional(),
  fechaRespuesta: yup.string().nullable().optional(),
  observacionesCliente: yup
    .string()
    .required("El pedido del cliente es requerido"),
});

type FormData = yup.InferType<typeof schema>;

const PresupuestoInformacionGeneral = () => {
  const { presupuesto, setPresupuesto } = usePresupuestoRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updatePresupuestoGeneralInfo } = useUpdatePresupuestoGeneralInfo();

  // Form methods para el modal con datos precargados
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      autoId: presupuesto.autoId,
      informacionAuto: presupuesto.informacionAuto || "",
      informacionCliente: presupuesto.informacionCliente || "",
      estado: presupuesto.estado,
      fechaEnvio: presupuesto.fechaEnvio
        ? presupuesto.fechaEnvio.toString().split("T")[0]
        : null,
      fechaRespuesta: presupuesto.fechaRespuesta
        ? presupuesto.fechaRespuesta.toString().split("T")[0]
        : null,
      observacionesCliente: presupuesto.observacionesCliente,
    },
  });

  // Handler para resetear el formulario con los valores actuales del presupuesto
  const handleOpenModal = () => {
    methods.reset({
      autoId: presupuesto.autoId,
      informacionAuto: presupuesto.informacionAuto || "",
      informacionCliente: presupuesto.informacionCliente || "",
      estado: presupuesto.estado,
      fechaEnvio: presupuesto.fechaEnvio
        ? presupuesto.fechaEnvio.toString().split("T")[0]
        : null,
      fechaRespuesta: presupuesto.fechaRespuesta
        ? presupuesto.fechaRespuesta.toString().split("T")[0]
        : null,
      observacionesCliente: presupuesto.observacionesCliente,
    });
  };

  // Handler para el submit del formulario
  const handleSubmit = async (data: FormData) => {
    try {
      const presupuestoActualizado = await updatePresupuestoGeneralInfo(
        presupuesto.id,
        {
          autoId: data.autoId,
          informacionAuto: data.informacionAuto || undefined,
          informacionCliente: data.informacionCliente || undefined,
          estado: data.estado,
          fechaEnvio: data.fechaEnvio || null,
          fechaRespuesta: data.fechaRespuesta || null,
          observacionesCliente: data.observacionesCliente,
        }
      );

      setPresupuesto(presupuestoActualizado);

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
      loading={false}
      formContent={<EditInformacionGeneralPresupuestoForm />}
      maxWidth="md"
    >
      {/* Primera fila: Cliente (izq) / Vehículo (der) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ClienteInfoPresupuesto
            cliente={presupuesto.auto?.owner}
            informacionCliente={presupuesto.informacionCliente}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <VehiculoInfoPresupuesto
            vehiculo={presupuesto.auto}
            informacionAuto={presupuesto.informacionAuto}
          />
        </Grid>
      </Grid>

      {/* Separador */}
      <Divider sx={{ my: 3, borderColor: "divider" }} />

      {/* Segunda fila: Estado y Fechas (izq) / Pedido del Cliente (der) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <EstadoYFechasInfoPresupuesto
            estado={presupuesto.estado}
            fechaEnvio={presupuesto.fechaEnvio}
            fechaRespuesta={presupuesto.fechaRespuesta}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PedidoClienteInfo observaciones={presupuesto.observacionesCliente} />
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default PresupuestoInformacionGeneral;
