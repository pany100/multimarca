import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { TextField } from "@mui/material";

function InputDetallesForm() {
  const { newItem, setNewItem } = useFormDataWithModalContext();
  const maxLength = 1024;
  return (
    <TextField
      autoFocus
      margin="dense"
      label="Observación"
      fullWidth
      multiline
      rows={3}
      onChange={(e) => setNewItem(e.target.value)}
      defaultValue={newItem || ""}
      placeholder="Ingrese trabajos realizados"
      helperText={`${(newItem || "").length}/${maxLength} caracteres`}
    />
  );
}

export default InputDetallesForm;
