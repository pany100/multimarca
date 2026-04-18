"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import VentaSearchAutocomplete, {
  VentaConDeuda,
} from "@/sections/ingresos-ventas/VentaSearchAutocomplete";
import { getFormattedDate } from "@/utils/fieldHelper";
import { Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useIngresoVenta } from "./contexts/IngresoVentaContext";
import { useUpdateIngresoVenta } from "./hooks/useUpdateIngresoVenta";

const schema = yup.object({
  ventaId: yup.number().required("Debe seleccionar una venta"),
});

const InfoField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1">{children}</Typography>
  </div>
);

function EditVentaForm({
  selectedVenta,
  setSelectedVenta,
}: {
  selectedVenta: VentaConDeuda | null;
  setSelectedVenta: (v: VentaConDeuda | null) => void;
}) {
  return (
    <VentaSearchAutocomplete
      value={selectedVenta}
      onChange={setSelectedVenta}
    />
  );
}

const IngresoVentaVentaSection = () => {
  const { ingreso, setIngreso } = useIngresoVenta();
  const { setSnackbar } = useSnackbarContext();
  const { updateIngresoVenta, loading } = useUpdateIngresoVenta();
  const venta = ingreso.venta;

  const [selectedVenta, setSelectedVenta] = useState<VentaConDeuda | null>(
    null
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ventaId: venta?.id },
  });

  const handleOpenModal = () => {
    setSelectedVenta(null);
    methods.reset({ ventaId: venta?.id });
  };

  const handleSubmit = async () => {
    if (!selectedVenta) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar una venta",
        severity: "error",
      });
      return;
    }

    try {
      const updated = await updateIngresoVenta(ingreso.id, {
        ventaId: selectedVenta.id,
      });
      setIngreso(updated);
      setSnackbar({
        open: true,
        message: "Venta asociada actualizada",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar",
        severity: "error",
      });
    }
  };

  return (
    <CommonOrderCard
      title="Venta Asociada"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      maxWidth="sm"
      formContent={
        <EditVentaForm
          selectedVenta={selectedVenta}
          setSelectedVenta={(v) => {
            setSelectedVenta(v);
            if (v) methods.setValue("ventaId", v.id);
          }}
        />
      }
    >
      {venta ? (
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <InfoField label="Venta">
              <Link
                href={`/dashboard/ventas/${venta.id}/ver`}
                style={{ textDecoration: "underline" }}
              >
                Venta #{venta.id}
              </Link>
            </InfoField>
          </Grid>
          <Grid item xs={6} md={4}>
            <InfoField label="Fecha de Venta">
              {getFormattedDate(venta.fecha)}
            </InfoField>
          </Grid>
          <Grid item xs={6} md={4}>
            <InfoField label="Cliente">
              {ingreso.cliente?.fullName ||
                ingreso.informacionCliente ||
                "No especificado"}
            </InfoField>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay información de venta disponible
        </Typography>
      )}
    </CommonOrderCard>
  );
};

export default IngresoVentaVentaSection;
