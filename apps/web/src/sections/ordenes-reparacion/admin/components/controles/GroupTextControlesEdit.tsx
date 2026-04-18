import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { Box, Chip, TextField, Typography } from "@mui/material";

type Props = {
  controls: ControlMecanico[];
  onChange: (controlId: number, valor: string) => void;
};

function GroupTextControlesEdit({ controls, onChange }: Props) {
  if (controls.length === 0) return null;

  return (
    <>
      {controls.map((control: ControlMecanico) => {
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
              spellCheck
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

export default GroupTextControlesEdit;
