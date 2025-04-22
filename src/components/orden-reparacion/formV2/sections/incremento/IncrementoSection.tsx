import CustomInputText from "@/components/formV2/CustomInputText";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

function IncrementoSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Grid container spacing={2}>
      <Grid item xs={4} ref={(el) => registerFieldRef("incremento", el)}>
        <CustomInputText name="incremento" label="Incremento" type="number" />
      </Grid>

      <Grid
        item
        xs={8}
        ref={(el) => registerFieldRef("descripcionIncremento", el)}
      >
        <CustomInputText
          name="descripcionIncremento"
          label="Descripción del incremento"
        />
      </Grid>
    </Grid>
  );
}

export default IncrementoSection;
