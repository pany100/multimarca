"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Grid } from "@mui/material";

const EditInformacionGeneralForm = () => {
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { orepEstadoOptions } = useFixedSelectData();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomAutocompleteInput
          name="autoId"
          label="Vehículo"
          searchOptions={searchAutos}
          initialOptions={initialAuto}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomInputText name="kilometros" label="Kilómetros" type="number" />
      </Grid>
      <Grid item xs={6}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={orepEstadoOptions}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomInputText
          name="fechaEntradaReparacion"
          label="Fecha de Entrada a Reparación"
          type="date"
        />
      </Grid>
      <Grid item xs={6}>
        <CustomInputText
          name="fechaSalidaReparacion"
          label="Fecha de Salida de Reparación"
          type="date"
        />
      </Grid>
      <Grid item xs={12}>
        <CustomInputText
          name="observacionesCliente"
          label="Observaciones del Cliente"
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
};

export default EditInformacionGeneralForm;
