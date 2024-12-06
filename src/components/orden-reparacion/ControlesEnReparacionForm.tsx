import {
  Box,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

type ControlMecanico = {
  id: number;
  nombre: string;
  tipo: "checkbox" | "texto";
  valor: string;
  detalle: string;
};

type Props = {
  controlesMecanicos: ControlMecanico[];
};

const ControlesEnReparacionForm: React.FC<Props> = ({ controlesMecanicos }) => {
  const { control, getValues, setValue } = useFormContext();

  const handleControlChange = (id: number, valor: string, detalle: string) => {
    const controlesEnReparacion = getValues("controlesEnReparacion");
    const controlesActualizados = controlesEnReparacion.map(
      (control: ControlMecanico) => {
        if (control.id === id) {
          return { id, valor, detalle };
        }
        return control;
      }
    );
    setValue("controlesEnReparacion", controlesActualizados);
  };

  const controlesEnForm = useWatch({ control, name: "controlesEnReparacion" });
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Controles Realizados
      </Typography>

      <Grid container spacing={2}>
        {controlesMecanicos
          .filter((control) => control.tipo === "checkbox")
          .map((control) => (
            <Grid
              item
              xs={12}
              key={control.id}
              sx={{ pt: "0 !important", mb: 1 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 40px 400px",
                }}
                alignItems="center"
                width="100%"
                gap={2}
              >
                <Typography>{control.nombre}</Typography>
                <Checkbox
                  checked={
                    controlesEnForm.find(
                      (formControl: any) => formControl.id === control.id
                    )?.valor === "true"
                  }
                  onChange={(e) =>
                    handleControlChange(
                      control.id,
                      e.target.checked ? "true" : "false",
                      control.detalle
                    )
                  }
                  sx={{ minWidth: "48px" }}
                />
                {controlesEnForm.find(
                  (formControl: any) => formControl.id === control.id
                )?.valor === "true" && (
                  <TextField
                    size="small"
                    placeholder="Detalle (Opcional)"
                    value={
                      controlesEnForm.find(
                        (formControl: any) => formControl.id === control.id
                      )?.detalle || ""
                    }
                    onChange={(e) =>
                      handleControlChange(control.id, "true", e.target.value)
                    }
                    sx={{ flex: 1, minWidth: "400px" }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        {controlesMecanicos
          .filter((control) => control.tipo !== "checkbox")
          .map((control) => (
            <Grid
              item
              xs={12}
              key={control.id}
              sx={{ pt: "0 !important", mb: 1 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 400px",
                }}
                alignItems="center"
              >
                <Typography style={{ marginRight: "16px" }}>
                  {control.nombre}
                </Typography>
                <TextField
                  fullWidth
                  defaultValue={control?.valor || ""}
                  onBlur={(e) =>
                    handleControlChange(control.id, e.target.value, "")
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
