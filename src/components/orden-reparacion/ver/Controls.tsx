"use client";
import useControles, {
  ControlMecanico,
} from "@/hooks/orden-reparacion/useControles";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function Controls({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Safely parse JSON array
  const safeParseArray = (jsonString: string | null | undefined): string[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch (e) {
      console.error("Error parsing JSON string:", e);
      return [];
    }
  };

  const { checkControls, textControls, groupControls } = useControles({
    controlesList: ordenReparacion.controlesEnReparacion.map(
      (control: any) => control.controlMecanico
    ),
  });

  const detalleControles = safeParseArray(ordenReparacion.detalleControles);

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <BuildCircleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Controles en Reparación
      </Typography>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
                height: "100%",
              }}
            >
              <List
                disablePadding
                sx={{ display: "grid", gridTemplateColumns: "auto auto" }}
              >
                {checkControls.map((control) => {
                  const isChecked = control.valor === "true";
                  return (
                    <ListItem
                      key={control.id}
                      dense
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        py: 0.75,
                        bgcolor: isChecked
                          ? "rgba(25, 118, 210, 0.08)"
                          : "transparent",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={isChecked}
                          disabled
                          disableRipple
                          icon={<RadioButtonUncheckedIcon />}
                          checkedIcon={
                            <CheckCircleOutlineIcon color="primary" />
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={control.name}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: isChecked ? 500 : 400,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          {groupControls.length > 0 &&
            groupControls.map((groupControl: any) => {
              const checkboxControls = groupControl.controls.filter(
                (control: any) => control.type === "checkbox"
              );

              return (
                <Grid item xs={12} key={groupControl.name}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 500, mb: 1.5 }}
                    >
                      {groupControl.name}
                    </Typography>
                    <List
                      disablePadding
                      sx={{ display: "grid", gridTemplateColumns: "auto auto" }}
                    >
                      {checkboxControls.length > 0 &&
                        checkboxControls.map((control: ControlMecanico) => {
                          const isChecked = control.valor === "true";
                          return (
                            <ListItem
                              key={control.id}
                              dense
                              sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                py: 0.75,
                                bgcolor: isChecked
                                  ? "rgba(25, 118, 210, 0.08)"
                                  : "transparent",
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                  edge="start"
                                  checked={isChecked}
                                  disabled
                                  disableRipple
                                  icon={<RadioButtonUncheckedIcon />}
                                  checkedIcon={
                                    <CheckCircleOutlineIcon color="primary" />
                                  }
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={control.name}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: isChecked ? 500 : 400,
                                }}
                              />
                            </ListItem>
                          );
                        })}
                    </List>
                  </Paper>
                </Grid>
              );
            })}

          {/* Text controls */}
          {textControls.length > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, mb: 1.5 }}
                >
                  Controles Adicionales
                </Typography>
                <List disablePadding>
                  {textControls.map((control) => (
                    <ListItem
                      key={control.id}
                      sx={{
                        px: 1,
                        py: 0.75,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                mr: 0.5,
                              }}
                            >
                              {control.name}:
                            </Typography>
                            <Typography variant="body2">
                              {control.valor || "-"}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Detalles section */}
          {detalleControles.length > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, mb: 1.5 }}
                >
                  Detalles:
                </Typography>
                <List disablePadding dense>
                  {detalleControles.map((element: string, index: number) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                color: theme.palette.primary.main,
                                mr: 1,
                                fontSize: "1.2rem",
                                lineHeight: 1,
                              }}
                            >
                              •
                            </Box>
                            {element}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
}

export default Controls;
