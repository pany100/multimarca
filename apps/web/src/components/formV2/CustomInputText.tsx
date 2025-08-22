import { TextField, TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const CustomInputText = (props: TextFieldProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, ...field } }) => (
        <TextField
          {...field}
          label={props.label}
          value={
            value && props.type === "date"
              ? new Date(value).toISOString().split("T")[0]
              : value ?? ""
          }
          type={props.type}
          fullWidth
          error={!!errors[props.name as string]}
          helperText={errors[props.name as string]?.message?.toString()}
          InputLabelProps={{
            ...props.InputLabelProps,
            shrink: props.type === "date" ? true : undefined,
          }}
          {...props}
        />
      )}
    />
  );
};

export default CustomInputText;
