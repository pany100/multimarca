import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";

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
  return (
    <FormControl fullWidth>
      <InputLabel id={props.id as string}>{props.label}</InputLabel>
      <Select labelId={props.id as string} label={props.label} {...props}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CustomSelect;
