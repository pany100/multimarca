import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  titulo: yup.string().required("El título es requerido"),
  texto: yup.string().required("El texto es requerido"),
});

const DatosVariosForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Datos varios
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="titulo" label="Título" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="texto"
            label="Texto"
            multiline
            rows={10}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DatosVariosForm;
