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
      render={({ field: { value, onChange, ...field } }) => (
        <TextField
          {...field}
          label={props.label}
          value={
            value && props.type === "date"
              ? new Date(value).toISOString().split("T")[0]
              : value ?? ""
          }
          onChange={(e) => {
            const newValue = e.target.value;
            if (props.type === "date") {
              // Convert empty string to null for date fields to avoid yup validation errors
              onChange(newValue === "" ? null : newValue);
            } else {
              onChange(newValue);
            }
          }}
          type={props.type}
          fullWidth
          error={!!errors[props.name as string]}
          helperText={errors[props.name as string]?.message?.toString()}
          InputLabelProps={{
            ...props.InputLabelProps,
            shrink: props.type === "date" ? true : undefined,
            autoCorrect: props.type === "text" ? "on" : undefined,
            autoCapitalize: props.type === "text" ? "on" : undefined,
          }}
          spellCheck={!props.type || props.type === "text" ? true : undefined}
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
      )}
    />
  );
};

export default CustomInputText;
