import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { TextField } from "@mui/material";

function InputObservationForm() {
  const { newItem, setNewItem } = useFormDataWithModalContext();
  return (
    <TextField
      autoFocus
      margin="dense"
      label="Observación"
      fullWidth
      multiline
      rows={4}
      onChange={(e) => setNewItem(e.target.value)}
      defaultValue={newItem || ""}
      placeholder="Describa el estado del vehículo al ingresar al taller"
      helperText="Incluya detalles como rasguños, abolladuras o cualquier detalle relevante sobre el estado del vehículo"
    />
  );
}

export default InputObservationForm;
