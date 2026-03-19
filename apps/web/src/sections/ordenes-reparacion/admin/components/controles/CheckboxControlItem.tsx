import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  ListItemButton,
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
        width: "100%",
        justifyContent: "space-between",
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
      <ListItemText
        primary={controlName}
        sx={{ flex: "0 1 auto", mr: 0.5 }}
        primaryTypographyProps={{
          variant: "body2",
          fontWeight: isChecked ? "medium" : "regular",
          ...(isLongName && {
            fontSize: "0.8rem",
          }),
        }}
      />
      <Checkbox
        edge="end"
        checked={isChecked}
        tabIndex={-1}
        disableRipple
        disabled={disabled}
        icon={<RadioButtonUncheckedIcon />}
        checkedIcon={<CheckCircleOutlineIcon color="primary" />}
        sx={{ ml: 1, mr: 2 }}
      />
    </ListItemButton>
  );
}

export default CheckboxControlItem;
