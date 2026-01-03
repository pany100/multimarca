import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

type Props = {
  isChecked: boolean;
  controlName: string;
  isLongName: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function CheckboxControlItem({
  isChecked,
  controlName,
  isLongName,
  disabled = false,
  onClick,
}: Props) {
  return (
    <ListItemButton
      dense
      disabled={disabled}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        transition: "all 0.2s",
        bgcolor: isChecked ? "primary.lighter" : "transparent",
        py: 0.25,
        px: 1,
        "&:hover": {
          bgcolor: isChecked ? "primary.lighter" : "action.hover",
        },
        "&.Mui-disabled": {
          opacity: 1,
        },
        "&.Mui-disabled .MuiCheckbox-root": {
          opacity: 0.36,
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Checkbox
          edge="start"
          checked={isChecked}
          tabIndex={-1}
          disableRipple
          disabled={disabled}
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
}

export default CheckboxControlItem;
