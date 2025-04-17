import CustomInputText from "@/components/formV2/CustomInputText";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

function TrabajosARealizarSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Grid item xs={12} ref={(el) => registerFieldRef("detallesDeTrabajo", el)}>
      <CustomInputText
        name="detallesDeTrabajo"
        label="Detalles de trabajo"
        multiline
        rows={4}
      />
    </Grid>
  );
}

export default TrabajosARealizarSection;
