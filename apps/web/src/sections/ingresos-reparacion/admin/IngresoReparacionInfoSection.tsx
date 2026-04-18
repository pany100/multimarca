"use client";

import ChequeData from "@/components/formV2/ChequeData";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useTipoOperacion from "@/hooks/useTipoOperacion";
import { CommonOrderCard } from "@/sections/ordenes-reparacion/admin/components/CommonOrderCard";
import {
  CHEQUE_OPERACION_IDS,
  getChequeIdAndValidate,
  getSchemaPropsForCheque,
} from "@/utils/chequeUtils";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import { Chip, Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useIngresoReparacion } from "./contexts/IngresoReparacionContext";
import { useUpdateIngresoReparacion } from "./hooks/useUpdateIngresoReparacion";

const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .min(0, "El monto debe ser mayor a 0"),
  moneda: yup.string().required("La moneda es requerida"),
  cotizacionDolar: yup.number().when("moneda", {
    is: "Dolar",
    then: (schema) => schema.required("La cotizacion es requerida"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  tipoOperacionId: yup.number().required("El tipo de operacion es requerido"),
  descripcion: yup.string().required("La descripcion es requerida"),
  ...getSchemaPropsForCheque("tipoOperacionId"),
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

const IngresoReparacionInfoSection = () => {
  const { ingreso, setIngreso } = useIngresoReparacion();
  const { setSnackbar } = useSnackbarContext();
  const { updateIngresoReparacion, loading } = useUpdateIngresoReparacion();
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

  const handleSubmit = async (data: any) => {
    try {
      const isCheque = CHEQUE_OPERACION_IDS.includes(data.tipoOperacionId);

      let chequeId = null;
      if (isCheque) {
        chequeId = await getChequeIdAndValidate(data, data.tipoOperacionId);
      }

      const updated = await updateIngresoReparacion(ingreso.id, {
        fecha: data.fecha,
        monto: data.monto,
        moneda: data.moneda,
        cotizacionDolar: data.moneda === "Dolar" ? data.cotizacionDolar : null,
        tipoOperacionId: data.tipoOperacionId,
        descripcion: data.descripcion,
        ...(isCheque && chequeId ? { chequeId } : {}),
      });
      setIngreso(updated);
      setSnackbar({
        open: true,
        message: "Informacion del pago actualizada",
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
  const tipoOpWatch = methods.watch("tipoOperacionId");
  const isChequeForm = CHEQUE_OPERACION_IDS.includes(tipoOpWatch);
  const isChequeDisplay = CHEQUE_OPERACION_IDS.includes(
    ingreso.tipoOperacionId
  );

  return (
    <CommonOrderCard
      title="Informacion del Pago"
      formMethods={methods}
      onSubmit={handleSubmit}
      onOpen={handleOpenModal}
      loading={loading}
      maxWidth="md"
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
                label="Cotizacion Dolar"
                type="number"
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <CustomSelect
              name="tipoOperacionId"
              label="Tipo de Operacion"
              options={tiposOperacion}
            />
          </Grid>
          {isChequeForm && (
            <Grid item xs={12}>
              <ChequeData />
            </Grid>
          )}
          <Grid item xs={12}>
            <CustomInputText
              name="descripcion"
              label="Descripcion"
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
          <InfoField label="Tipo de Operacion">
            {isChequeDisplay && ingreso.chequeId ? (
              <Link
                href={`/dashboard/cheques/${ingreso.chequeId}`}
                style={{ textDecoration: "underline" }}
              >
                {ingreso.tipoOperacion?.label || "Cheque"}{" "}
                {ingreso.cheque?.rechazado && "(Rechazado)"}
              </Link>
            ) : (
              ingreso.tipoOperacion?.label || "No especificado"
            )}
          </InfoField>
        </Grid>
        {ingreso.moneda === "Dolar" && ingreso.cotizacionDolar && (
          <Grid item xs={6} md={4}>
            <InfoField label="Cotizacion Dolar">
              {getFormattedPrice(ingreso.cotizacionDolar)}
            </InfoField>
          </Grid>
        )}
        <Grid item xs={12}>
          <InfoField label="Descripcion">
            {ingreso.descripcion || "Sin descripcion"}
          </InfoField>
        </Grid>
      </Grid>
    </CommonOrderCard>
  );
};

export default IngresoReparacionInfoSection;
