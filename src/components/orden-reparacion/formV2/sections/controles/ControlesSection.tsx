import useControles from "@/hooks/orden-reparacion/useControles";
import { Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import CheckboxControls from "./CheckboxControls";
import GroupControls from "./GroupControls";
import TextControls from "./TextControls";

function ControlesSection() {
  const { watch } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");

  const { checkControls, textControls, groupControls } = useControles({
    controlesList: controlesEnReparacion,
  });

  return (
    <Grid container spacing={3}>
      {checkControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <CheckboxControls />
        </Grid>
      )}
      {groupControls.length > 0 && (
        <Grid container item xs={12} spacing={2}>
          <GroupControls />
        </Grid>
      )}
      {textControls.length > 0 && (
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
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Información Adicional
            </Typography>
            <TextControls />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}

export default ControlesSection;
