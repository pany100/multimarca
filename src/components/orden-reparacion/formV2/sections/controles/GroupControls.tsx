import useControles from "@/hooks/orden-reparacion/useControles";
import { Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import GroupCheckboxControls from "./GroupCheckboxControls";
import GroupTextControls from "./GroupTextControls";

function GroupControls() {
  const { watch } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");

  const { groupControls } = useControles({
    controlesList: controlesEnReparacion,
  });

  return (
    <>
      {groupControls.map((groupControl: any) => {
        const checkboxControls = groupControl.controls.filter(
          (control: any) => control.tipo === "checkbox"
        );
        const textControls = groupControl.controls.filter(
          (control: any) => control.tipo === "texto"
        );
        return (
          <Grid item xs={12} key={groupControl.name}>
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
                {groupControl.name}
              </Typography>
              <GroupCheckboxControls controls={checkboxControls} />
              <GroupTextControls controls={textControls} />
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}
export default GroupControls;
