import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type CustomSelectProps = SelectProps & {
  placeholder?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
  noOptionsText?: string;
};

const CustomSelect = ({
  helperText,
  placeholder = "Seleccionar opción",
  options = [],
  noOptionsText = "No hay opciones disponibles",
  ...props
}: CustomSelectProps) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  return (
    <Controller
      name={props.name as string}
      control={control}
      render={({ field: { value, onChange, ...field } }) => {
        const currentValue = props.multiple ? value ?? [] : value ?? "";

        return (
          <FormControl fullWidth>
            <InputLabel id={props.name as string}>{props.label}</InputLabel>
            <Select
              labelId={props.name as string}
              label={props.label}
              value={currentValue}
              onChange={onChange}
              error={!!errors[props.name as string]}
              renderValue={
                props.multiple
                  ? (selected: any) => {
                      const selectedOptions = options.filter((option) =>
                        selected.includes(option.value)
                      );
                      return selectedOptions
                        .map((option) => option.label)
                        .join(", ");
                    }
                  : undefined
              }
              {...props}
            >
              {options.length > 0 ? (
                options.map((option) => {
                  return (
                    <MenuItem key={option.value} value={option.value}>
                      {props.multiple ? (
                        <>
                          <Checkbox
                            checked={
                              Array.isArray(currentValue) &&
                              currentValue.some(
                                (itemValue) =>
                                  itemValue.toString() ===
                                  option.value.toString()
                              )
                            }
                          />
                          <ListItemText primary={option.label} />
                        </>
                      ) : (
                        option.label
                      )}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled value="">
                  <em>{noOptionsText}</em>
                </MenuItem>
              )}
            </Select>
            {(helperText || errors[props.name as string]?.message) && (
              <FormHelperText error={!!errors[props.name as string]}>
                {(errors[props.name as string]?.message as string) ||
                  helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default CustomSelect;
