import { TextField, TextFieldProps } from "@mui/material";

function ORepTextField(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      margin="normal"
      InputLabelProps={{ shrink: true }}
      sx={{
        "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
          {
            WebkitAppearance: "none",
            margin: 0,
          },
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
        ...props.sx,
      }}
      onWheel={(e) => {
        if (props.type === "number") {
          (e.target as HTMLElement).blur();
        }
      }}
      {...props}
    />
  );
}

export default ORepTextField;
