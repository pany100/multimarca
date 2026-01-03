import { Grid, Paper, Typography } from "@mui/material";
import GroupCheckboxControlesEdit from "./GroupCheckboxControlesEdit";

type Props = {
  groupControls: any[];
  isEditing: boolean;
};

function GroupControlesEdit({ groupControls, isEditing }: Props) {
  return (
    <>
      {groupControls.map((groupControl: any) => {
        const checkboxControls = groupControl.controls.filter(
          (control: any) => control.type === "checkbox"
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
                isEditing={isEditing}
              />
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}

export default GroupControlesEdit;
