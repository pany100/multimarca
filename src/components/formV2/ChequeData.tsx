import { Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import ImageInput from "../ImageInput";
import CustomInputText from "./CustomInputText";

function ChequeData() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const picturePath = watch("picturePath");
  return (
    <Paper
      elevation={1}
      sx={{
        ml: 2,
        mt: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#fafafa",
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: "primary.main",
          fontWeight: "medium",
        }}
      >
        Datos del Cheque
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="fechaEmision"
            label="Fecha emisión"
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fechaCobro" label="Fecha cobro" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="numeroCheque"
            label="Número de Cheque"
            type="text"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="banco" label="Banco" type="text" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="importe" label="Importe" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="emisor" label="Emisor" type="text" />
        </Grid>
        <Grid item xs={12} md={12}>
          <ImageInput
            label="Foto"
            image={picturePath || ""}
            setImage={(e) => setValue("picturePath", e)}
          />
          {errors.picturePath && (
            <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
              {errors.picturePath.message as string}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ChequeData;
