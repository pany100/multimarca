"use client";

import CustomSelect from "@/components/formV2/CustomSelect";
import useAdmins from "@/hooks/useAdmins";
import { Grid } from "@mui/material";

function EditRevisionForm() {
  const { admins } = useAdmins();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomSelect
          name="revisadoPorId"
          label="Revisado Por"
          options={admins}
        />
      </Grid>
    </Grid>
  );
}

export default EditRevisionForm;
