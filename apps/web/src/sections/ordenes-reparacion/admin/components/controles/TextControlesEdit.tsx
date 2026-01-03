import { ControlMecanico } from "@/hooks/orden-reparacion/useControles";
import { Box, TextField, Typography } from "@mui/material";
import { useControlesContext } from "../../contexts/ControlesContext";
import { useOrden } from "../../contexts/OrdenContext";

type Props = {
  textControls: ControlMecanico[];
  isEditing: boolean;
};

function TextControlesEdit({ textControls, isEditing }: Props) {
  const { itemsEdited, updateControl } = useControlesContext();
  const { orden } = useOrden();

  return (
    <>
      {textControls.map((control: ControlMecanico) => {
        const editedControl = itemsEdited.find(
          (item) => item.id === control.id
        );
        const originalControl = orden.controlesEnReparacion?.find(
          (item: ControlMecanico) => item.id === control.id
        );
        const currentValue =
          editedControl?.valor ?? originalControl?.valor ?? "";

        return (
          <Box key={control.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {control.name}
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              value={currentValue}
              placeholder={`Ingrese información sobre ${control.name.toLowerCase()}`}
              onChange={(e) => updateControl(control, e.target.value)}
              disabled={!isEditing}
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
