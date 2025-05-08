import useControlesInnerForm from "@/hooks/orden-reparacion/useControlesInnerForm";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Control } from "./CheckboxControls";

function GroupCheckboxControls({ controls }: { controls: any }) {
  const { handleControlChange } = useControlesInnerForm();
  return (
    <List
      disablePadding
      sx={{ display: "grid", gridTemplateColumns: "auto auto" }}
    >
      {controls.map((control: Control) => {
        const isChecked = control.valor === "true";
        const controlName = control.pdfName || control.nombre;
        return (
          <ListItemButton
            key={control.id}
            dense
            onClick={() =>
              handleControlChange(control.id, isChecked ? "false" : "true")
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                checked={isChecked}
                tabIndex={-1}
                disableRipple
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleOutlineIcon color="primary" />}
              />
            </ListItemIcon>
            <ListItemText
              primary={controlName}
              primaryTypographyProps={{
                variant: "body2",
                fontWeight: isChecked ? "medium" : "regular",
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default GroupCheckboxControls;
