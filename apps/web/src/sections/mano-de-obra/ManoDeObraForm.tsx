import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  pdfName: yup.string().nullable().optional(),
  sellPrice: yup.number().required("El precio de venta es requerido"),
});

const ManoDeObraForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información de Mano de Obra
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText multiline name="name" label="Nombre del Trabajo" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="pdfName"
            label="Nombre del PDF"
            placeholder="-"
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="sellPrice"
            label="Precio de Venta"
            type="number"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ManoDeObraForm;
