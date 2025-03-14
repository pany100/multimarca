import TextListInput from "@/components/TextListInput";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Box, Grid, Paper, Typography } from "@mui/material";
import ControlesEnReparacionForm from "../../ControlesEnReparacionForm";

type Props = {
  ordenReparacion: {
    controlesEnReparacion: {
      id: number;
      valor: string;
      controlMecanico: {
        id: number;
        name: string;
        type: string;
      };
    }[];
  };
};

function ControlesSection({ ordenReparacion }: Props) {
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
        <ConstructionIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Controles Realizados y observaciones de salida
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ControlesEnReparacionForm
            controlesMecanicos={ordenReparacion.controlesEnReparacion.map(
              (control) => ({
                id: control.id,
                nombre: control.controlMecanico.name,
                tipo:
                  control.controlMecanico.type === "checkbox"
                    ? "checkbox"
                    : "texto",
                valor: control.valor,
              })
            )}
          />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <TextListInput
              inputName="detalleControles"
              label="Detalle de controles"
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 2 }}>
        <Grid item xs={12}>
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
            <TextListInput
              inputName="observacionesSalida"
              label="Observaciones de salida"
            />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ControlesSection;
