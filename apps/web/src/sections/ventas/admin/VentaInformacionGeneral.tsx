"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ClienteInfoVenta } from "./components/ClienteInfoVenta";
import { EstadoYFechaInfoVenta } from "./components/EstadoYFechaInfoVenta";
import { useVentaRequired } from "./contexts/VentaContext";
import EditInformacionGeneralVentaForm from "./forms/EditInformacionGeneralVentaForm";
import { useUpdateVentaGeneralInfo } from "./hooks/useUpdateVentaGeneralInfo";

const schema = yup.object({
  clienteId: yup
    .number()
    .nullable()
    .optional()
    .test(
      "cliente-or-info-required",
      "Debe seleccionar un cliente o ingresar información del cliente",
      function (value) {
        const { informacionCliente } = this.parent;
        return !!value || !!informacionCliente;
      }
    ),
  informacionCliente: yup
    .string()
    .nullable()
    .optional()
    .test(
      "cliente-or-info-required",
      "Debe seleccionar un cliente o ingresar información del cliente",
      function (value) {
        const { clienteId } = this.parent;
        return !!clienteId || !!value;
      }
    ),
  estado: yup.string().required("El estado es requerido"),
  fecha: yup.string().required("La fecha es requerida"),
});

type FormData = yup.InferType<typeof schema>;

const VentaInformacionGeneral = () => {
  const { venta, setVenta } = useVentaRequired();
  const { setSnackbar } = useSnackbarContext();
  const { updateVentaGeneralInfo } = useUpdateVentaGeneralInfo();

  // Form methods para el modal con datos precargados
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      clienteId: venta.clienteId,
      informacionCliente: venta.informacionCliente || "",
      estado: venta.estado,
      fecha: venta.fecha
        ? venta.fecha.toString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  // Handler para resetear el formulario con los valores actuales de la venta
  const handleOpenModal = () => {
    methods.reset({
      clienteId: venta.clienteId,
      informacionCliente: venta.informacionCliente || "",
      estado: venta.estado,
      fecha: venta.fecha
        ? venta.fecha.toString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  };

  // Handler para el submit del formulario
  const handleSubmit = async (data: FormData) => {
    try {
      const ventaActualizada = await updateVentaGeneralInfo(venta.id, {
        clienteId: data.clienteId,
        informacionCliente: data.informacionCliente || null,
        estado: data.estado,
        fecha: data.fecha,
      });

      setVenta(ventaActualizada);

      setSnackbar({
        open: true,
        message: "Información actualizada correctamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar la información: " + error,
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
      formContent={<EditInformacionGeneralVentaForm />}
      maxWidth="sm"
    >
      {/* Primera fila: Cliente (izq) / Estado y Fecha (der) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ClienteInfoVenta
            cliente={venta.cliente}
            informacionCliente={venta.informacionCliente}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <EstadoYFechaInfoVenta estado={venta.estado} fecha={venta.fecha} />
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default VentaInformacionGeneral;
