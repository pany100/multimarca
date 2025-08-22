import CustomInputText from "@/components/formV2/CustomInputText";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import useScrollToError from "@/hooks/useScrollToError";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

type Props = {
  isVenta?: boolean;
};

function ResumenCostosSection({ isVenta = false }: Props) {
  const {
    control,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { totalOrdenReparacion } = useNuevaOrden({ control });

  return (
    <Grid container spacing={2}>
      {!isVenta && (
        <>
          <Grid
            item
            xs={4}
            ref={(el) => registerFieldRef("incrementoInterno", el)}
          >
            <CustomInputText
              name="incrementoInterno"
              label="Incremento Interno"
              type="number"
            />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              Este incremento va a mostrarse como parte de la mano de obra
              cuando se imprima el informe al cliente
            </Typography>
          </Grid>
        </>
      )}
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
      <Grid item xs={4} ref={(el) => registerFieldRef("incremento", el)}>
        <CustomInputText name="incremento" label="Incremento" type="number" />
      </Grid>

      <Grid
        item
        xs={8}
        ref={(el) => registerFieldRef("descripcionIncremento", el)}
      >
        <CustomInputText
          name="descripcionIncremento"
          label="Descripción del incremento"
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
  );
}

export default ResumenCostosSection;
