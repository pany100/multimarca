import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  nombre: yup.string().required("El nombre es requerido"),
  fecha: yup.date().required("La fecha es requerida"),
  herramienta: yup.string().required("La herramienta es requerida"),
  devuelto: yup.boolean(),
});

const PrestamoHerramientasForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Préstamo
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="nombre" label="Nombre" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="herramienta"
            label="Herramienta"
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputBoolean name="devuelto" label="Devuelto?" />
        </Grid>
      </Grid>
    </>
  );
};

export default PrestamoHerramientasForm;
