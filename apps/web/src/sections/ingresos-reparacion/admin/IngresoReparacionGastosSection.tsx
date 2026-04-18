"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useIngresoReparacion } from "./contexts/IngresoReparacionContext";
import { useUpdateIngresoReparacion } from "./hooks/useUpdateIngresoReparacion";

const schema = yup.object({
  gastosBancarios: yup.number().default(0),
  gastosArba: yup.number().default(0),
});

type FormData = yup.InferType<typeof schema>;

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

const IngresoReparacionGastosSection = () => {
  const { ingreso, setIngreso } = useIngresoReparacion();
  const { setSnackbar } = useSnackbarContext();
  const { updateIngresoReparacion, loading } = useUpdateIngresoReparacion();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      gastosBancarios: parseFloat(ingreso.gastosBancarios) || 0,
      gastosArba: parseFloat(ingreso.gastosArba) || 0,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      gastosBancarios: parseFloat(ingreso.gastosBancarios) || 0,
      gastosArba: parseFloat(ingreso.gastosArba) || 0,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const updated = await updateIngresoReparacion(ingreso.id, {
        gastosBancarios: data.gastosBancarios,
        gastosArba: data.gastosArba,
      });
      setIngreso(updated);
      setSnackbar({
        open: true,
        message: "Gastos actualizados",
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
      title="Gastos Adicionales"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      maxWidth="xs"
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomInputText
              name="gastosBancarios"
              label="Gastos Bancarios (en pesos)"
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <CustomInputText
              name="gastosArba"
              label="Gastos ARBA (en pesos)"
              type="number"
            />
          </Grid>
        </Grid>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoField label="Gastos Bancarios">
            {getFormattedPrice(ingreso.gastosBancarios)}
          </InfoField>
        </Grid>
        <Grid item xs={6}>
          <InfoField label="Gastos ARBA">
            {getFormattedPrice(ingreso.gastosArba)}
          </InfoField>
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default IngresoReparacionGastosSection;
