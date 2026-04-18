"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import OrdenSearchAutocomplete, {
  OrdenConDeuda,
} from "@/sections/ingresos-reparacion/OrdenSearchAutocomplete";
import { getFormattedDate } from "@/utils/fieldHelper";
import { Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useIngresoReparacion } from "./contexts/IngresoReparacionContext";
import { useUpdateIngresoReparacion } from "./hooks/useUpdateIngresoReparacion";

const schema = yup.object({
  ordenReparacionId: yup
    .number()
    .required("Debe seleccionar una orden de reparacion"),
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

function EditOrdenForm({
  selectedOrden,
  setSelectedOrden,
}: {
  selectedOrden: OrdenConDeuda | null;
  setSelectedOrden: (v: OrdenConDeuda | null) => void;
}) {
  return (
    <OrdenSearchAutocomplete
      value={selectedOrden}
      onChange={setSelectedOrden}
    />
  );
}

const IngresoReparacionOrdenSection = () => {
  const { ingreso, setIngreso } = useIngresoReparacion();
  const { setSnackbar } = useSnackbarContext();
  const { updateIngresoReparacion, loading } = useUpdateIngresoReparacion();
  const orden = ingreso.ordenReparacion;

  const [selectedOrden, setSelectedOrden] = useState<OrdenConDeuda | null>(
    null
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ordenReparacionId: orden?.id },
  });

  const handleOpenModal = () => {
    setSelectedOrden(null);
    methods.reset({ ordenReparacionId: orden?.id });
  };

  const handleSubmit = async () => {
    if (!selectedOrden) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar una orden de reparacion",
        severity: "error",
      });
      return;
    }

    try {
      const updated = await updateIngresoReparacion(ingreso.id, {
        ordenReparacionId: selectedOrden.id,
      });
      setIngreso(updated);
      setSnackbar({
        open: true,
        message: "Orden asociada actualizada",
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

  const autoLabel = orden?.auto
    ? [orden.auto.patent, orden.auto.brand, orden.auto.model]
        .filter(Boolean)
        .join(" - ")
    : "Sin auto";

  return (
    <CommonOrderCard
      title="Orden de Reparacion Asociada"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      maxWidth="sm"
      formContent={
        <EditOrdenForm
          selectedOrden={selectedOrden}
          setSelectedOrden={(v) => {
            setSelectedOrden(v);
            if (v) methods.setValue("ordenReparacionId", v.id);
          }}
        />
      }
    >
      {orden ? (
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <InfoField label="Orden">
              <Link
                href={`/dashboard/ordenes-reparacion/${orden.id}`}
                style={{ textDecoration: "underline" }}
              >
                OdR #{orden.id}
              </Link>
            </InfoField>
          </Grid>
          <Grid item xs={6} md={4}>
            <InfoField label="Auto">{autoLabel}</InfoField>
          </Grid>
          <Grid item xs={6} md={4}>
            <InfoField label="Fecha">
              {orden.fechaEntradaReparacion
                ? getFormattedDate(orden.fechaEntradaReparacion)
                : getFormattedDate(orden.fechaCreacion)}
            </InfoField>
          </Grid>
          <Grid item xs={6} md={4}>
            <InfoField label="Cliente">
              {ingreso.cliente?.fullName || "No especificado"}
            </InfoField>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay informacion de orden disponible
        </Typography>
      )}
    </CommonOrderCard>
  );
};

export default IngresoReparacionOrdenSection;
