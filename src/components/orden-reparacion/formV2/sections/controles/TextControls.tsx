import useControles from "@/hooks/orden-reparacion/useControles";
import useControlesInnerForm from "@/hooks/orden-reparacion/useControlesInnerForm";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

type Control = {
  id: number;
  tipo: string;
  valor: string;
  nombre: string;
};

function TextControls() {
  const { watch } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");
  const { handleControlChange } = useControlesInnerForm();

  const { textControls } = useControles({
    controlesList: controlesEnReparacion,
  });

  return textControls.map((control: Control) => {
    const hasValue = control.valor !== "";
    const currentValue = control.valor;

    return (
      <Box key={control.id} sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {control.nombre}
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
          placeholder={`Ingrese información sobre ${control.nombre.toLowerCase()}`}
          defaultValue={currentValue}
          onBlur={(e) => handleControlChange(control.id, e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
            },
          }}
        />
      </Box>
    );
  });
}

export default TextControls;
