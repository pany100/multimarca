import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { Grid, List, Paper } from "@mui/material";
import { useControlesContext } from "../../contexts/ControlesContext";
import CheckboxControlItem from "./CheckboxControlItem";

const MAX_CONTROL_LENGTH = 25;

type Props = {
  checkControls: ControlMecanico[];
  isEditing: boolean;
};

function CheckboxControlesEdit({ checkControls, isEditing }: Props) {
  const { updateControl } = useControlesContext();
  return (
    <Grid item xs={12}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          height: "100%",
        }}
      >
        <List
          disablePadding
          sx={{
            display: "grid",
            gridTemplateColumns: "auto auto",
          }}
        >
          {checkControls.map((control: ControlMecanico) => {
            const isChecked = control.valor === "true";
            const controlName = control.pdfName || control.name;
            const isLongName = controlName.length > MAX_CONTROL_LENGTH;

            return (
              <CheckboxControlItem
                key={control.id}
                isChecked={isChecked}
                controlName={controlName}
                isLongName={isLongName}
                onClick={() =>
                  updateControl(control, isChecked ? "false" : "true")
                }
                disabled={!isEditing}
              />
            );
          })}
        </List>
      </Paper>
    </Grid>
  );
}

export default CheckboxControlesEdit;
