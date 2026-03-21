"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Checkbox, ListItemButton, Typography } from "@mui/material";

type Props = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

/**
 * Fila compacta: checkbox pegado al texto (sin espacio intermedio como en controles de OR).
 */
export function RolPermisoRow({
  label,
  checked,
  disabled = false,
  onToggle,
}: Props) {
  return (
    <ListItemButton
      dense
      disabled={disabled}
      onClick={onToggle}
      sx={{
        borderRadius: 1,
        py: 0.125,
        px: 0.75,
        minHeight: 34,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 0.75,
        bgcolor: checked ? "action.selected" : "transparent",
        "&:hover": {
          bgcolor: checked ? "action.selected" : "action.hover",
        },
        "&.Mui-disabled": { opacity: 1 },
        "&.Mui-disabled .MuiCheckbox-root": { opacity: 0.4 },
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        disabled={disabled}
        tabIndex={-1}
        disableRipple
        icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />}
        checkedIcon={
          <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 20 }} />
        }
        sx={{
          p: 0,
          mt: "2px",
          pointerEvents: "none",
        }}
      />
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          pt: "4px",
          lineHeight: 1.35,
          fontWeight: checked ? 500 : 400,
        }}
      >
        {label}
      </Typography>
    </ListItemButton>
  );
}
