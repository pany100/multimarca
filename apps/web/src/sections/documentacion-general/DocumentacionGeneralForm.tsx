import CustomFileInput from "@/components/formV2/CustomFileInput";
import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  titulo: yup.string().required("El título es requerido"),
  archivoPath: yup.string().nullable(),
});

const DocumentacionGeneralForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Documento
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="titulo" label="Título" />
        </Grid>
        <Grid item xs={12}>
          <CustomFileInput
            name="archivoPath"
            label="Archivo (PDF o Word)"
            accept=".pdf,.doc,.docx"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DocumentacionGeneralForm;
