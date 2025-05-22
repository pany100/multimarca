import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { Checkbox, FormControlLabel, Grid } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";

function PresupuestoAutoSection({
  showBorrador = true,
}: {
  showBorrador?: boolean;
}) {
  const {
    control,
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
      {showBorrador && (
        <Grid
          item
          xs={12}
          md={6}
          ref={(el) => registerFieldRef("kilometros", el)}
        >
          <Controller
            name="esBorrador"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                }
                label="Guardar como borrador"
              />
            )}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default PresupuestoAutoSection;
