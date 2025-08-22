import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

function CustomInputBoolean({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          defaultValue={false}
          render={({ field: { value, onChange, ...field } }) => (
            <Checkbox
              {...field}
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
          )}
        />
      }
      label={label}
    />
  );
}

export default CustomInputBoolean;
