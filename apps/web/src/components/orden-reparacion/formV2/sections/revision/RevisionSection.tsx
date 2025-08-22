import CustomSelect from "@/components/formV2/CustomSelect";
import useAdmins from "@/hooks/useAdmins";
import useScrollToError from "@/hooks/useScrollToError";
import { Box, Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

function RevisionSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { admins } = useAdmins();
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={2}>
          <Typography variant="body1" fontWeight="medium">
            Revisado Por
          </Typography>
        </Grid>
        <Grid item xs={10} ref={(el) => registerFieldRef("revisadoPor", el)}>
          <CustomSelect
            name="revisadoPorId"
            label="Revisado Por"
            options={admins}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default RevisionSection;
