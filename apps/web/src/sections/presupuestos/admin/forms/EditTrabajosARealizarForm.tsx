import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid } from "@mui/material";

const EditTrabajosARealizarForm = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomInputText
          name="detallesDeTrabajo"
          label="Detalles de trabajo"
          multiline
          rows={4}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default EditTrabajosARealizarForm;
