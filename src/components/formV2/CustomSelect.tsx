import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";

type CustomSelectProps = SelectProps & {
  placeholder?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
  control: Control<any>;
  errors: FieldErrors<any>;
};

const CustomSelect = ({
  helperText,
  placeholder = "Seleccionar opción",
  options = [],
  control,
  errors,
  ...props
}: CustomSelectProps) => {
  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <FormControl fullWidth>
          <InputLabel id={props.name as string}>{props.label}</InputLabel>
          <Select
            labelId={props.name as string}
            label={props.label}
            value={value ?? ""}
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
      )}
    />
  );
};

export default CustomSelect;
