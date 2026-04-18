"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import { Chip, Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useIngresoVenta } from "./contexts/IngresoVentaContext";
import { useUpdateIngresoVenta } from "./hooks/useUpdateIngresoVenta";

const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotización es requerida"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  tipoOperacionId: yup.number().required("El tipo de operación es requerido"),
  descripcion: yup.string().required("La descripción es requerida"),
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

const IngresoVentaInfoSection = () => {
  const { ingreso, setIngreso } = useIngresoVenta();
  const { setSnackbar } = useSnackbarContext();
  const { updateIngresoVenta, loading } = useUpdateIngresoVenta();
  const { currency } = useFixedSelectData();
  const { tiposOperacion } = useTipoOperacion("ingreso");

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: ingreso.fecha,
      monto: parseFloat(ingreso.monto),
      moneda: ingreso.moneda,
      cotizacionDolar: ingreso.cotizacionDolar
        ? parseFloat(ingreso.cotizacionDolar)
        : undefined,
      tipoOperacionId: ingreso.tipoOperacionId,
      descripcion: ingreso.descripcion,
    },
  });

  const handleOpenModal = () => {
    methods.reset({
      fecha: ingreso.fecha,
      monto: parseFloat(ingreso.monto),
      moneda: ingreso.moneda,
      cotizacionDolar: ingreso.cotizacionDolar
        ? parseFloat(ingreso.cotizacionDolar)
        : undefined,
      tipoOperacionId: ingreso.tipoOperacionId,
      descripcion: ingreso.descripcion,
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const updated = await updateIngresoVenta(ingreso.id, {
        fecha: data.fecha,
        monto: data.monto,
        moneda: data.moneda,
        cotizacionDolar: data.moneda === "Dolar" ? data.cotizacionDolar : null,
        tipoOperacionId: data.tipoOperacionId,
        descripcion: data.descripcion,
      });
      setIngreso(updated);
      setSnackbar({
        open: true,
        message: "Información del pago actualizada",
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

  const monedaWatch = methods.watch("moneda");

  return (
    <CommonOrderCard
      title="Información del Pago"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      maxWidth="sm"
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomInputText name="fecha" label="Fecha" type="date" />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomInputText name="monto" label="Monto" type="number" />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect name="moneda" label="Moneda" options={currency} />
          </Grid>
          {monedaWatch === "Dolar" && (
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="cotizacionDolar"
                label="Cotización Dolar"
                type="number"
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <CustomSelect
              name="tipoOperacionId"
              label="Tipo de Operación"
              options={tiposOperacion}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomInputText
              name="descripcion"
              label="Descripción"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <InfoField label="Fecha">{getFormattedDate(ingreso.fecha)}</InfoField>
        </Grid>
        <Grid item xs={6} md={4}>
          <InfoField label="Monto">
            {getFormattedPrice(ingreso.monto)}{" "}
            <Chip
              label={ingreso.moneda}
              color={ingreso.moneda === "Dolar" ? "success" : "warning"}
              size="small"
              sx={{ ml: 0.5 }}
            />
          </InfoField>
        </Grid>
        <Grid item xs={6} md={4}>
          <InfoField label="Tipo de Operación">
            {ingreso.tipoOperacion?.label || "No especificado"}
          </InfoField>
        </Grid>
        {ingreso.moneda === "Dolar" && ingreso.cotizacionDolar && (
          <Grid item xs={6} md={4}>
            <InfoField label="Cotización Dolar">
              {getFormattedPrice(ingreso.cotizacionDolar)}
            </InfoField>
          </Grid>
        )}
        <Grid item xs={12}>
          <InfoField label="Descripción">
            {ingreso.descripcion || "Sin descripción"}
          </InfoField>
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default IngresoVentaInfoSection;
