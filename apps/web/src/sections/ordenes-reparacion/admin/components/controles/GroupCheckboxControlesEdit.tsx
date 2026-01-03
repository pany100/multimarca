import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

const MAX_CONTROL_LENGTH = 25;

type Props = {
  controls: ControlMecanico[];
  onChange: (controlId: number, valor: string) => void;
};

function GroupCheckboxControlesEdit({ controls, onChange }: Props) {
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
        const isChecked = control.valor === "true";
        const controlName = control.pdfName || control.name;
        const isLongName = controlName.length > MAX_CONTROL_LENGTH;

        return (
          <ListItemButton
            key={control.id}
            dense
            onClick={() => onChange(control.id, isChecked ? "false" : "true")}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              transition: "all 0.2s",
              bgcolor: isChecked ? "primary.lighter" : "transparent",
              "&:hover": {
                bgcolor: isChecked ? "primary.lighter" : "action.hover",
              },
            }}
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
                ...(isLongName && {
                  fontSize: "0.8rem",
                }),
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default GroupCheckboxControlesEdit;
