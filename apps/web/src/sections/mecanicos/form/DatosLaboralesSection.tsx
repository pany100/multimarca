import CustomInputPassword from "@/components/formV2/CustomInputPassword";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { Box, Grid, Typography } from "@mui/material";

function DatosLaboralesSection() {
  return (
    <>
      {/* Separador */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom>
          Datos laborales
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <CustomInputText name="dni" label="CUIT/CUIL" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomInputPassword name="claveFiscal" label="Clave Fiscal" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomSelect
            options={[
              { value: "Mecanico", label: "Mecanico" },
              { value: "Administrativo", label: "Administrativo" },
              { value: "EquipoDirectivo", label: "Equipo Directivo" },
            ]}
            name="tipo"
            label="Tipo"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default DatosLaboralesSection;
