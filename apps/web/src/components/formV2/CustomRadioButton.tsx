import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "@mui/material";

type CustomRadioButtonProps = Omit<
  RadioGroupProps,
  "name" | "value" | "onChange"
> & {
  name?: string;
  label?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: boolean;
};

const CustomRadioButton = ({
  name,
  label,
  options = [],
  helperText,
  value,
  onChange,
  error = false,
  ...props
}: CustomRadioButtonProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // Try to convert to number if the original option value was a number
    const option = options.find((opt) => opt.value.toString() === newValue);
    if (option && onChange) {
      onChange(option.value);
    }
  };

  return (
    <FormControl
      fullWidth
      error={error}
      component="fieldset"
      variant="standard"
    >
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        name={name}
        value={value?.toString() ?? ""}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value.toString()}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomRadioButton;
