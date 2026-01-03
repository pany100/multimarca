import { Grid, Paper, Typography } from "@mui/material";
import GroupCheckboxControlesView from "./GroupCheckboxControlesView";
import GroupTextControlesView from "./GroupTextControlesView";

type Props = {
  groupControls: any[];
};

function GroupControlesView({ groupControls }: Props) {
  return (
    <>
      {groupControls.map((groupControl: any) => {
        const checkboxControls = groupControl.controls.filter(
          (control: any) => control.type === "checkbox"
        );
        const textControls = groupControl.controls.filter(
          (control: any) => control.type === "texto"
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
              <GroupCheckboxControlesView controls={checkboxControls} />
              <GroupTextControlesView controls={textControls} />
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}

export default GroupControlesView;
