import useControles, {
  ControlMecanico,
} from "@/hooks/orden-reparacion/useControles";
import useControlesInnerForm from "@/hooks/orden-reparacion/useControlesInnerForm";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Checkbox,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { useFormContext } from "react-hook-form";

export type Control = {
  id: number;
  tipo: string;
  valor: string;
  nombre: string;
  ordenEnPdf: number | null;
  pdfName: string | null;
};

const MAX_CONTROL_LENGTH = 25;

function CheckboxControls() {
  const { watch } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");

  const { handleControlChange } = useControlesInnerForm();
  const { checkControls } = useControles({
    controlesList: controlesEnReparacion,
  });
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
            const controlName = control.pdfName || control.nombre;
            const isLongName = controlName.length > MAX_CONTROL_LENGTH;

            return (
              <ListItemButton
                key={control.id}
                dense
                onClick={() =>
                  handleControlChange(control.id, isChecked ? "false" : "true")
                }
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
      </Paper>
    </Grid>
  );
}

export default CheckboxControls;
