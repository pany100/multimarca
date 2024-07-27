import {
  Box,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useFormContext } from "react-hook-form";

type ControlMecanico = {
  id: number;
  nombre: string;
  tipo: "checkbox" | "texto";
  valor: string;
};

type Props = {
  controlesMecanicos: ControlMecanico[];
};

const ControlesEnReparacionForm: React.FC<Props> = ({ controlesMecanicos }) => {
  const { control, getValues, setValue } = useFormContext();

  const handleControlChange = (id: number, valor: string) => {
    const controlesEnReparacion = getValues("controlesEnReparacion");
    console.log(controlesEnReparacion);
    const controlesActualizados = controlesEnReparacion.map(
      (control: ControlMecanico) => {
        if (control.id === id) {
          return { id, valor };
        }
        return control;
      }
    );
    setValue("controlesEnReparacion", controlesActualizados);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Trabajos Realizados
      </Typography>

      <Grid container spacing={2}>
        {controlesMecanicos
          .filter((control) => control.tipo === "checkbox")
          .map((control) => (
            <Grid item xs={6} key={control.id} sx={{ pt: "0 !important" }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography>{control.nombre}</Typography>
                <Checkbox
                  defaultChecked={control?.valor === "true"}
                  onChange={(e) =>
                    handleControlChange(
                      control.id,
                      e.target.checked ? "true" : "false"
                    )
                  }
                />
              </Box>
            </Grid>
          ))}
        {controlesMecanicos
          .filter((control) => control.tipo !== "checkbox")
          .map((control) => (
            <Grid item xs={12} key={control.id} sx={{ pt: "0 !important" }}>
              <Box display="flex" alignItems="center">
                <Typography style={{ marginRight: "16px", minWidth: "120px" }}>
                  {control.nombre}
                </Typography>
                <TextField
                  fullWidth
                  defaultValue={control?.valor || ""}
                  onBlur={(e) =>
                    handleControlChange(control.id, e.target.value)
                  }
                  size="small"
                />
              </Box>
            </Grid>
          ))}
      </Grid>
      <Divider sx={{ my: 2 }} />
    </>
  );
};

export default ControlesEnReparacionForm;
