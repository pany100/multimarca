import useControles, {
  ControlMecanico,
} from "@/hooks/orden-reparacion/useControles";
import { getFormattedControlName } from "@/utils/fieldHelper";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Box,
  Checkbox,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useWatch } from "react-hook-form";

type Props = {
  controlesMecanicos: ControlMecanico[];
};

const ControlesEnReparacionForm: React.FC<Props> = ({ controlesMecanicos }) => {
  const { handleControlChange, getGroupedControls, getControlStats, control } =
    useControles({
      controlesMecanicos,
    });

  const controlesEnForm = useWatch({ control, name: "controlesEnReparacion" });
  const controlGroups = getGroupedControls();

  return (
    <Box>
      {/* Progress indicator */}

      <Grid container spacing={2}>
        {/* Checkbox controls in groups */}
        {controlGroups.slice(0, 2).map(
          (group, index) =>
            group.controls.length > 0 && (
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
                    {group.controls.map((control) => {
                      const isChecked =
                        controlesEnForm.find(
                          (formControl: any) => formControl.id === control.id
                        )?.valor === "true";

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
                            primary={getFormattedControlName(control.nombre)}
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

        {/* Text input controls */}
        {controlGroups[2].controls.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {controlGroups[2].title}
              </Typography>
              {controlGroups[2].controls.map((control) => {
                const currentValue =
                  controlesEnForm.find(
                    (formControl: any) => formControl.id === control.id
                  )?.valor || "";

                const hasValue = currentValue.trim().length > 0;

                return (
                  <Box key={control.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {getFormattedControlName(control.nombre)}
                      </Typography>
                      {hasValue && (
                        <Chip
                          label="Completado"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Ingrese información sobre ${getFormattedControlName(
                        control.nombre.toLowerCase()
                      )}`}
                      defaultValue={currentValue}
                      onBlur={(e) =>
                        handleControlChange(control.id, e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ControlesEnReparacionForm;
