import { Fade, Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import ImageInput from "../ImageInput";
import CustomInputText from "./CustomInputText";

function ChequeFields({ nuevoFormVisible }: { nuevoFormVisible: boolean }) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const picturePath = watch("picturePath");
  return (
    <Fade
      in={nuevoFormVisible}
      timeout={500}
      unmountOnExit
      style={{ display: !nuevoFormVisible ? "none" : "block" }}
    >
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomInputText
              name="fechaEmision"
              label="Fecha emisión"
              type="date"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomInputText
              name="fechaCobro"
              label="Fecha cobro"
              type="date"
            />
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
      </div>
    </Fade>
  );
}

export default ChequeFields;
