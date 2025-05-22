import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";

function PresupuestoAutoSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { searchAutos, initialAuto } = useAutosAutocomplete();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} ref={(el) => registerFieldRef("autoId", el)}>
        <CustomAutocompleteInput
          name="autoId"
          label="Vehículo"
          searchOptions={searchAutos}
          initialOptions={initialAuto}
        />
      </Grid>
    </Grid>
  );
}

export default PresupuestoAutoSection;
