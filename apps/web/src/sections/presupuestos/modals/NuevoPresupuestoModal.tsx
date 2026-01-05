"use client";

import CommonModalForm from "@/components/commons/CommonModalForm";
import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import { useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useNuevoPresupuestoHandlers } from "../hooks/useNuevoPresupuestoHandlers";

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
  observacionesCliente: yup
    .string()
    .required("Las observaciones del cliente son requeridas"),
});

type FormData = yup.InferType<typeof schema>;

interface NuevoPresupuestoModalProps {
  refreshTable?: () => void;
}

const NuevoPresupuestoModal = ({
  refreshTable,
}: NuevoPresupuestoModalProps) => {
  const { isOpen, hideModal } = useGlobalModal();
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const [tabValue, setTabValue] = useState(0);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      autoId: null,
      informacionAuto: "",
      informacionCliente: "",
      observacionesCliente: "",
    },
  });

  const handleClose = () => {
    methods.reset();
    setTabValue(0);
    hideModal();
  };

  const { handleSubmit, loading } = useNuevoPresupuestoHandlers({
    onClose: handleClose,
    refreshTable,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Limpiar los campos del otro tab cuando se cambia
    if (newValue === 0) {
      methods.setValue("informacionAuto", "");
      methods.setValue("informacionCliente", "");
    } else {
      methods.setValue("autoId", null);
    }
  };

  return (
    <CommonModalForm
      open={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Nuevo Presupuesto"
      methods={methods}
      loading={loading}
      submitButtonText="Crear Presupuesto"
      maxWidth="md"
    >
      <Grid container spacing={2}>
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
          <Grid item xs={12}>
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
            <Grid item xs={12} md={6}>
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

        {/* Sección de Observaciones del Cliente */}
        <Grid item xs={12}>
          <CustomInputText
            name="observacionesCliente"
            label="Detalles proporcionados por el cliente"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </CommonModalForm>
  );
};

export default NuevoPresupuestoModal;
