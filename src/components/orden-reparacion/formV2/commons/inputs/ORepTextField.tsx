import { TextField, TextFieldProps } from "@mui/material";

function ORepTextField(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      margin="normal"
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );
}

export default ORepTextField;
