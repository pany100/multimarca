import CustomInputText from "@/components/formV2/CustomInputText";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

function HiddenObservationSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Grid
      item
      xs={12}
      ref={(el) => registerFieldRef("observacionesOcultas", el)}
    >
      <CustomInputText
        name="observacionesOcultas"
        label="Notas internas"
        multiline
        rows={4}
      />
    </Grid>
  );
}

export default HiddenObservationSection;
