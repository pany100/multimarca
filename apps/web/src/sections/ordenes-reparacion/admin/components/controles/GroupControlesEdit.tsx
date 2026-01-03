import { Grid, Paper, Typography } from "@mui/material";
import GroupCheckboxControlesEdit from "./GroupCheckboxControlesEdit";
import GroupTextControlesEdit from "./GroupTextControlesEdit";

type Props = {
  groupControls: any[];
  onChange: (controlId: number, valor: string) => void;
};

function GroupControlesEdit({ groupControls, onChange }: Props) {
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
              <GroupCheckboxControlesEdit
                controls={checkboxControls}
                onChange={onChange}
              />
              <GroupTextControlesEdit
                controls={textControls}
                onChange={onChange}
              />
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}

export default GroupControlesEdit;
