import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import {
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";

const MAX_CONTROL_LENGTH = 25;

type Props = {
  checkControls: ControlMecanico[];
};

function CheckboxControlesView({ checkControls }: Props) {
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
                    sx={{
                      color: "action.active",
                      "&.Mui-checked": {
                        color: "primary.main",
                      },
                      "&.Mui-disabled": {
                        color: "action.active",
                      },
                      "&.Mui-checked.Mui-disabled": {
                        color: "primary.main",
                      },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={controlName}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: isChecked ? "medium" : "regular",
                    color: "text.primary",
                    ...(isLongName && {
                      fontSize: "0.8rem",
                    }),
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Grid>
  );
}

export default CheckboxControlesView;
