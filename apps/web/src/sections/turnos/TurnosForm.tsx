"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputDate from "@/components/formV2/CustomInputDate";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomInputTime from "@/components/formV2/CustomInputTime";
import { useFormInfo } from "@/contexts/FormInfoContext";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
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
      },
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
      },
    ),
  informacionPatente: yup.string().nullable().optional(),
  clienteNombre: yup.string().nullable().optional(),
  clienteTelefono: yup.string().nullable().optional(),
  vino: yup.boolean().nullable().optional(),
  observaciones: yup.string().nullable().optional(),
});

const TurnosForm = () => {
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { control, setValue, watch } = useFormContext();
  const { isEditing } = useFormInfo();
  const [tabValue, setTabValue] = useState(0);

  const autoId = watch("autoId");
  const informacionAuto = watch("informacionAuto");
  const informacionPatente = watch("informacionPatente");
  const clienteNombre = watch("clienteNombre");
  const clienteTelefono = watch("clienteTelefono");
  const hasClienteInfo = !!(clienteNombre || clienteTelefono);

  // Inicializar el tab correcto cuando se está editando
  useEffect(() => {
    if (isEditing) {
      if (
        !autoId &&
        (informacionAuto || informacionPatente || hasClienteInfo)
      ) {
        setTabValue(1);
      } else if (autoId) {
        setTabValue(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (tabValue === 0 && autoId) {
      if (informacionAuto || hasClienteInfo) {
        setValue("informacionAuto", "");
        setValue("informacionPatente", "");
        setValue("clienteNombre", "");
        setValue("clienteTelefono", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoId, tabValue]);

  useEffect(() => {
    if (
      tabValue === 1 &&
      (informacionAuto || informacionPatente || hasClienteInfo)
    ) {
      if (autoId) {
        setValue("autoId", null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    informacionAuto,
    informacionPatente,
    clienteNombre,
    clienteTelefono,
    tabValue,
  ]);

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
          <Grid item xs={12} sx={{ mb: 2 }}>
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
            <Grid item xs={12} md={6} sx={{ mb: 2 }}>
              <CustomInputText name="informacionAuto" label="Modelo" />
            </Grid>
            <Grid item xs={12} md={6} sx={{ mb: 2 }}>
              <CustomInputText name="informacionPatente" label="Patente" />
            </Grid>
            <Grid item xs={12} md={6} sx={{ mb: 2 }}>
              <CustomInputText
                name="clienteNombre"
                label="Nombre del cliente"
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ mb: 2 }}>
              <CustomInputText
                name="clienteTelefono"
                label="Teléfono del cliente"
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

        <Grid item xs={12} md={6}>
          <Controller
            name="vino"
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => {
              const selectValue =
                value === null || value === undefined
                  ? ""
                  : value
                    ? "true"
                    : "false";
              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel id="vino-label">Vino</InputLabel>
                  <Select
                    {...field}
                    labelId="vino-label"
                    label="Vino"
                    value={selectValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChange(v === "" ? null : v === "true");
                    }}
                  >
                    <MenuItem value="">Sin responder</MenuItem>
                    <MenuItem value="true">Sí</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              );
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomInputText
            name="observaciones"
            label="Observaciones"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TurnosForm;
