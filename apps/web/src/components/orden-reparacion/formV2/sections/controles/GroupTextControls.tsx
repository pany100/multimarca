import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import useControlesInnerForm from "@/hooks/orden-reparacion/useControlesInnerForm";
import { Box, Chip, TextField, Typography } from "@mui/material";

function GroupTextControls({ controls }: { controls: ControlMecanico[] }) {
  const { handleControlChange } = useControlesInnerForm();
  return controls.map((control: ControlMecanico) => {
    const hasValue = control.valor !== "";
    const currentValue = control.valor;

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
          placeholder={`Ingrese información sobre ${control.name.toLowerCase()}`}
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

export default GroupTextControls;
