import CustomInputText from "@/components/formV2/CustomInputText";
import PaidIcon from "@mui/icons-material/Paid";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import useScrollToError from "@/hooks/useScrollToError";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

function PriceSection() {
  const {
    control,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { totalOrdenReparacion } = useNuevaOrden({ control });
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <PaidIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Resumen de Costos
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={4} ref={(el) => registerFieldRef("descuento", el)}>
          <CustomInputText name="descuento" label="Descuento" type="number" />
        </Grid>

        <Grid
          item
          xs={8}
          ref={(el) => registerFieldRef("descripcionDescuento", el)}
        >
          <CustomInputText
            name="descripcionDescuento"
            label="Descripción del descuento"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 1,
              backgroundColor: "primary.lighter",
              borderRadius: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold" color="primary.dark">
                Total Orden de Reparación
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary.dark"
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ${" "}
                {isNaN(totalOrdenReparacion)
                  ? "0.00"
                  : totalOrdenReparacion.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default PriceSection;
