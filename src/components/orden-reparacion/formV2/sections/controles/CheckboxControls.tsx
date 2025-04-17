import useControlesInnerForm from "@/hooks/orden-reparacion/useControlesInnerForm";
import { getFormattedControlName } from "@/utils/fieldHelper";
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

type Control = {
  id: number;
  tipo: string;
  valor: string;
  nombre: string;
  ordenEnPdf: number | null;
  pdfName: string | null;
};

// Sort controls by ordenEnPdf field, same as in OrdenMecanicoPdf
function sortControls(a: Control, b: Control) {
  if (!a.ordenEnPdf || a.ordenEnPdf === null) return 1;
  if (!b.ordenEnPdf || b.ordenEnPdf === null) return -1;
  return (a.ordenEnPdf || 0) - (b.ordenEnPdf || 0);
}

function CheckboxControls() {
  const { checkControls, handleControlChange } = useControlesInnerForm();
  // Sort controls using the same function as in OrdenMecanicoPdf
  const sortedControls = [...checkControls].sort(sortControls);

  const midpoint = Math.ceil(sortedControls.length / 2);
  const firstGroup = sortedControls.slice(0, midpoint);
  const secondGroup = sortedControls.slice(midpoint);
  const controlGroups = [firstGroup, secondGroup];

  return (
    <>
      {controlGroups.slice(0, 2).map(
        (group, index) =>
          group.length > 0 && (
            <Grid item xs={12} md={6} key={index}>
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
                <List disablePadding>
                  {group.map((control: Control) => {
                    const isChecked = control.valor === "true";

                    return (
                      <ListItemButton
                        key={control.id}
                        dense
                        onClick={() =>
                          handleControlChange(
                            control.id,
                            isChecked ? "false" : "true"
                          )
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          transition: "all 0.2s",
                          bgcolor: isChecked
                            ? "primary.lighter"
                            : "transparent",
                          "&:hover": {
                            bgcolor: isChecked
                              ? "primary.lighter"
                              : "action.hover",
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
                            checkedIcon={
                              <CheckCircleOutlineIcon color="primary" />
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={getFormattedControlName(
                            control.pdfName || control.nombre
                          )}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: isChecked ? "medium" : "regular",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
          )
      )}
    </>
  );
}

export default CheckboxControls;
