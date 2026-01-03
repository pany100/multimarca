import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { Box, Chip, TextField, Typography } from "@mui/material";

type Props = {
  textControls: ControlMecanico[];
  onChange: (controlId: number, valor: string) => void;
};

function TextControlesEdit({ textControls, onChange }: Props) {
  return (
    <>
      {textControls.map((control: ControlMecanico) => {
        const hasValue = control.valor !== "";

        return (
          <Box key={control.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {control.name}
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
              defaultValue={control.valor}
              placeholder={`Ingrese información sobre ${control.name.toLowerCase()}`}
              onBlur={(e) => onChange(control.id, e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        );
      })}
    </>
  );
}

export default TextControlesEdit;
