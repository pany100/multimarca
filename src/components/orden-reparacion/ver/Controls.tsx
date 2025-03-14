"use client";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

function Controls({ ordenReparacion }: { ordenReparacion: any }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        <BuildCircleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Controles en Reparación
      </Typography>
      <Grid container spacing={2}>
        {ordenReparacion.controlesEnReparacion
          .filter(
            (control: { controlMecanico: { type: string } }) =>
              control.controlMecanico.type === "checkbox"
          )
          .map(
            (control: {
              id: string;
              controlMecanico: { name: string };
              valor: string;
              detalle?: string;
            }) => (
              <Grid item xs={12} sm={6} key={control.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>{control.controlMecanico.name}</Typography>
                  <Checkbox
                    checked={control.valor === "true"}
                    disabled
                    edge="end"
                  />
                </Box>
              </Grid>
            )
          )}
        {ordenReparacion.controlesEnReparacion
          .filter(
            (control: { controlMecanico: { type: string } }) =>
              control.controlMecanico.type !== "checkbox"
          )
          .map(
            (control: {
              id: string;
              controlMecanico: { name: string };
              valor: string;
            }) => (
              <Grid item xs={12} key={control.id}>
                <Typography>
                  {control.controlMecanico.name}: {control.valor || "-"}
                </Typography>
              </Grid>
            )
          )}
        {ordenReparacion.detalleControles &&
          JSON.parse(ordenReparacion.detalleControles || "[]").length > 0 && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">Detalles:</Typography>
              </Grid>
              <List sx={{ mt: 0, py: 0 }}>
                {JSON.parse(ordenReparacion.detalleControles || "[]").map(
                  (element: string, index: number) => (
                    <ListItem key={index} sx={{ py: 0.0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ my: 0 }}>
                            ◦ {element}
                          </Typography>
                        }
                      />
                    </ListItem>
                  )
                )}
              </List>
            </>
          )}
      </Grid>
    </>
  );
}

export default Controls;
