import CustomInputText from "@/components/formV2/CustomInputText";
import { useFormContext } from "react-hook-form";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  id: yup.number().optional(),
  valor: yup.string().required("El valor es requerido"),
});

const ConfiguracionGeneralForm = () => {
  const { register } = useFormContext();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Configuración General
      </Typography>

      <input type="hidden" {...register("id")} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="valor" label="Valor" multiline rows={4} />
        </Grid>
      </Grid>
    </>
  );
};

export default ConfiguracionGeneralForm;
