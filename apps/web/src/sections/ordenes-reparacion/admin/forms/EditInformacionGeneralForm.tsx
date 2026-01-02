"use client";

import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import { Grid } from "@mui/material";

const EditInformacionGeneralForm = () => {
  const { searchAutos, initialAuto } = useAutosAutocomplete();

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
      <Grid item xs={12}>
        <CustomInputText name="kilometros" label="Kilómetros" type="number" />
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
