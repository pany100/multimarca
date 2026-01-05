import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Box, Divider, Grid, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

const estadosPresupuesto = [
  { value: "EnPreparacion", label: "En Preparación" },
  { value: "Terminado", label: "Terminado" },
  { value: "Enviado", label: "Enviado" },
  { value: "ADefinir", label: "A Definir" },
  { value: "Aceptado", label: "Aceptado" },
  { value: "Rechazado", label: "Rechazado" },
  { value: "Descartado", label: "Descartado" },
];

const EditInformacionGeneralPresupuestoForm = () => {
  const { watch, setValue } = useFormContext();
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { presupuestoEstadoOptions } = useFixedSelectData();

  const autoId = watch("autoId");
  const informacionAuto = watch("informacionAuto");
  const [tabValue, setTabValue] = useState(
    autoId || (!autoId && !informacionAuto) ? 0 : 1
  );

  // Cuando se selecciona un vehículo existente, limpiar información manual
  useEffect(() => {
    if (autoId) {
      setValue("informacionAuto", "");
      setValue("informacionCliente", "");
    }
  }, [autoId, setValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Solo limpiar autoId cuando se va al tab de vehículo nuevo
    if (newValue === 1) {
      setValue("autoId", null);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Información del Vehículo con Tabs */}
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
            <CustomInputText name="informacionAuto" label="Patente y modelo" />
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
        <Divider sx={{ my: 1, borderColor: "divider" }} />
      </Grid>
      {/* Estado */}
      <Grid item xs={12} md={6}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={presupuestoEstadoOptions}
        />
      </Grid>

      {/* Fecha de Envío */}
      <Grid item xs={12} md={6}>
        <CustomInputText
          name="fechaEnvio"
          label="Fecha de Envío"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Fecha de Respuesta */}
      <Grid item xs={12} md={6}>
        <CustomInputText
          name="fechaRespuesta"
          label="Fecha de Respuesta"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Pedido del Cliente */}
      <Grid item xs={12}>
        <CustomInputText
          name="observacionesCliente"
          label="Pedido del Cliente"
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
};

export default EditInformacionGeneralPresupuestoForm;
