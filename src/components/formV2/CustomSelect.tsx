import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type CustomSelectProps = SelectProps & {
  placeholder?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
};

const CustomSelect = ({
  helperText,
  placeholder = "Seleccionar opción",
  options = [],
  ...props
}: CustomSelectProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, onChange, ...field } }) => {
        return (
          <FormControl fullWidth>
            <InputLabel id={props.name as string}>{props.label}</InputLabel>
            <Select
              labelId={props.name as string}
              label={props.label}
              value={props.multiple ? value ?? [] : value ?? ""}
              onChange={onChange}
              error={!!errors[props.name as string]}
              {...props}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText error={!!errors[props.name as string]}>
                {helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default CustomSelect;
