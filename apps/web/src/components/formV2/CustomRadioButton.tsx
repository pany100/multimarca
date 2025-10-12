import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type CustomRadioButtonProps = Omit<RadioGroupProps, "name"> & {
  name: string;
  label?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
};

const CustomRadioButton = ({
  name,
  label,
  options = [],
  helperText,
  ...props
}: CustomRadioButtonProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <FormControl
          fullWidth
          error={!!errors[name]}
          component="fieldset"
          variant="standard"
        >
          {label && <FormLabel component="legend">{label}</FormLabel>}
          <RadioGroup
            {...field}
            value={value ?? ""}
            onChange={onChange}
            {...props}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(helperText || errors[name]?.message) && (
            <FormHelperText error={!!errors[name]}>
              {(errors[name]?.message as string) || helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default CustomRadioButton;
