import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

const MAX_CONTROL_LENGTH = 25;

type Props = {
  controls: ControlMecanico[];
};

function GroupCheckboxControlesView({ controls }: Props) {
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
          <ListItem
            key={control.id}
            dense
            sx={{
              borderRadius: 1,
              mb: 0.5,
              bgcolor: isChecked ? "primary.lighter" : "transparent",
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                checked={isChecked}
                disabled
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
          </ListItem>
        );
      })}
    </List>
  );
}

export default GroupCheckboxControlesView;
