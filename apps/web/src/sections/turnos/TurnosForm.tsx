"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputDate from "@/components/formV2/CustomInputDate";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomInputTime from "@/components/formV2/CustomInputTime";
import { useFormInfo } from "@/contexts/FormInfoContext";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup
    .date()
    .required("La fecha es requerida")
    .min(
      dayjs().startOf("day").toDate(),
      "No se puede crear un turno para una fecha pasada"
    ),
  hora: yup.string().required("La hora es requerida"),
  problema: yup
    .string()
    .required("La descripción del problema es requerida")
    .max(255, "La descripción no puede exceder los 255 caracteres"),
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
});

const TurnosForm = () => {
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { setValue, watch } = useFormContext();
  const { isEditing } = useFormInfo();
  const [tabValue, setTabValue] = useState(0);

  const autoId = watch("autoId");
  const informacionAuto = watch("informacionAuto");
  const informacionCliente = watch("informacionCliente");

  // Inicializar el tab correcto cuando se está editando
  useEffect(() => {
    if (isEditing) {
      // Si está editando y no hay autoId pero hay informacionAuto o informacionCliente, mostrar tab de vehículo nuevo
      if (!autoId && (informacionAuto || informacionCliente)) {
        setTabValue(1);
      } else if (autoId) {
        // Si hay autoId, mostrar tab de vehículo existente
        setTabValue(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // No limpiar los campos al cambiar de tab
    // Los campos se limpiarán solo cuando el usuario ingrese datos en el tab activo
  };

  // Limpiar campos del otro tab cuando se ingresa algo en el tab actual
  useEffect(() => {
    if (tabValue === 0 && autoId) {
      // Si estamos en el tab de vehículo existente y hay un autoId, limpiar los campos del otro tab
      if (informacionAuto || informacionCliente) {
        setValue("informacionAuto", "");
        setValue("informacionCliente", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoId, tabValue]);

  useEffect(() => {
    if (tabValue === 1 && (informacionAuto || informacionCliente)) {
      // Si estamos en el tab de vehículo nuevo y hay datos, limpiar el autoId
      if (autoId) {
        setValue("autoId", null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informacionAuto, informacionCliente, tabValue]);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Turno
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputDate name="fecha" label="Fecha" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputTime
            name="hora"
            label="Hora"
            minTime="08:00"
            maxTime="17:00"
            minutesStep={30}
          />
        </Grid>

        {/* Sección de Información del Vehículo con Tabs */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="vehicle selection tabs"
            >
              <Tab label="Vehículo existente en sistema" />
              <Tab label="Vehículo nuevo" />
            </Tabs>
          </Box>
        </Grid>

        {tabValue === 0 ? (
          // Vehículo existente en sistema
          <Grid item xs={12} sx={{mb: 2}}>
            <CustomAutocompleteInput
              name="autoId"
              label="Vehículo"
              searchOptions={searchAutos}
              initialOptions={initialAuto}
            />
          </Grid>
        ) : (
          // Vehículo nuevo
          <>
            <Grid item xs={12} md={6} sx={{mb: 2}}>
              <CustomInputText
                name="informacionAuto"
                label="Patente y modelo"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="informacionCliente"
                label="Datos del cliente"
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <CustomInputText
            name="problema"
            label="Descripción del problema"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TurnosForm;
