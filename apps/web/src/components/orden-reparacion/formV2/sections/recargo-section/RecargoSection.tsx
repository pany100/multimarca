import CustomInputText from "@/components/formV2/CustomInputText";

import useScrollToError from "@/hooks/useScrollToError";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

function RecargoSection() {
  const {
    control,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} ref={(el) => registerFieldRef("porcentajeRecargo", el)}>
        <CustomInputText
          name="porcentajeRecargo"
          label="Porcentaje de recargo"
          type="number"
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1">
          Recargo aplicado a las reparaciones de terceros y repuestos utilizados
        </Typography>
      </Grid>
    </Grid>
  );
}

export default RecargoSection;
