import { TextField, TextFieldProps } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";

type Props = TextFieldProps & {
  control: Control<any>;
  errors: FieldErrors<any>;
};

const CustomInputText = ({ control, errors, ...props }: Props) => {
  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, ...field } }) => (
        <TextField
          {...field}
          label={props.label}
          value={value ?? ""}
          type={props.type}
          fullWidth
          error={!!errors[props.name as string]}
          helperText={errors[props.name as string]?.message?.toString()}
          {...props}
        />
      )}
    />
  );
};

export default CustomInputText;
