import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { Box, Chip, TextField, Typography } from "@mui/material";

type Props = {
  textControls: ControlMecanico[];
};

function TextControlesView({ textControls }: Props) {
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
              value={control.valor}
              disabled
              placeholder={`Información sobre ${control.name.toLowerCase()}`}
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

export default TextControlesView;
