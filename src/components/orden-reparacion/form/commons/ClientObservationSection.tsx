import CustomInputText from "@/components/formV2/CustomInputText";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

function ClientObservationSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "medium", color: "primary.main" }}
      >
        Observaciones del Cliente
      </Typography>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          ref={(el) => registerFieldRef("observacionesCliente", el)}
        >
          <CustomInputText
            name="observacionesCliente"
            label="Detalles proporcionados por el cliente"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ClientObservationSection;
