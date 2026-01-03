import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { List } from "@mui/material";
import { useControlesContext } from "../../contexts/ControlesContext";
import CheckboxControlItem from "./CheckboxControlItem";

const MAX_CONTROL_LENGTH = 25;

type Props = {
  controls: ControlMecanico[];
  isEditing: boolean;
};

function GroupCheckboxControlesEdit({ controls, isEditing }: Props) {
  const { isChecked, updateControl } = useControlesContext();

  if (controls.length === 0) return null;

  return (
    <List
      disablePadding
      sx={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        mb: 2,
      }}
    >
      {controls.map((control: ControlMecanico) => {
        const checked = isChecked(control.id);
        const controlName = control.pdfName || control.name;
        const isLongName = controlName.length > MAX_CONTROL_LENGTH;

        return (
          <CheckboxControlItem
            key={control.id}
            isChecked={checked}
            controlName={controlName}
            isLongName={isLongName}
            onClick={() => updateControl(control, checked ? "false" : "true")}
            disabled={!isEditing}
          />
        );
      })}
    </List>
  );
}

export default GroupCheckboxControlesEdit;
